const db = require('../db/index');
const Error = require('../models/error.js');

exports.activateDevice = async function activateDevice(req, res) {
    const installation_code = req.params.code;
    const selectDevice = "Select fa.DeviceName, fa.DeviceId, fa.CampaignID from FADevice fa where fa.InstallationCode = $1";
    try {
        const selectRes = await db.pool.query(selectDevice, [installation_code]);
        if (selectRes.rowCount === 0) {
            const error = new Error(6, "Invalid installation code.");
            res.status(404);
            res.send(error);
            return;
        }
        const response = {
            Name: selectRes.rows[0].devicename,
            DeviceId: selectRes.rows[0].deviceid,
            CampaignID: selectRes.rows[0].campaignid
        };
        console.log(response);
        res.status(200);
        res.send(response);
    } catch (err) {
        res.status(500);
        const error = new Error(0, "Unknown server error");
        res.send(error);

    }
}

const insertResponse = " Insert into UserResponse(QuestionID,AnswerID,CustomAnswer,DeviceId) values($1,$2,$3,$4)";
exports.saveResponse = async function saveResponse(req, res) {
    const responses = req.body.UserResponses;
    const deviceid = req.body.DeviceId;
    if (responses == null) {
        console.log("GOT WRONG\n " + JSON.stringify(req.body));
        res.status(404);
        const error = new Error(4, "Invalid json format.");
        res.send(error);
        return;
    }
    for (let i = 0; i < responses.length; i++) {
        let response = responses[i];
        if(response.AnswerId == -1)response.AnswerId=null;
        try {
            const insertRes = await db.pool.query(insertResponse, [response.QuestionId, response.AnswerId, response.CustomAnswer,deviceid]);
        } catch (err) {
            res.status(400);
            res.send({
                error: err
            });
            return;
        }
    }
    res.status(200);
    res.send({
        success: true
    });
}


const selectResponsesFull = `
select q.questiontext, coalesce(a.answertext, 'Empty')  AS answertext , ur.customanswer , ur.date, ur.deviceid, fa.campaignid,fa.devicename
from question q,answer a,userresponse ur ,fadevice fa
where q.questionid = ur.questionid and ( a.answerid = ur.answerid) and ur.deviceid = fa.deviceid and fa.campaignid = $1

UNION

select q.questiontext, coalesce(null, ' ')  AS answertext , ur.customanswer , ur.date, ur.deviceid, fa.campaignid,fa.devicename
from question q,userresponse ur ,fadevice fa
where q.questionid = ur.questionid and ur.answerid is null and ur.deviceid = fa.deviceid and fa.campaignid = $2;

`
const selectResponsesDevice = `
select q.questiontext, coalesce(a.answertext, 'Empty')  AS answertext , ur.customanswer , ur.date, ur.deviceid,fa.devicename
from question q,answer a,userresponse ur , fadevice fa
where q.questionid = ur.questionid and a.answerid = ur.answerid and ur.deviceid = fa.deviceid and fa.deviceid = $1

UNION

select q.questiontext, coalesce(null, ' ')  AS answertext , ur.customanswer , ur.date, ur.deviceid,fa.devicename
from question q,userresponse ur , fadevice fa
where q.questionid = ur.questionid and ur.answerid is null and ur.deviceid = fa.deviceid  and fa.deviceid = $2;
`
exports.getResponses = async function getResponses(req, res) {

    const {CampaignId,DeviceId} = req.body;

    if(CampaignId==null){
        if (responses == null) {
            console.log("GOT WRONG\n " + JSON.stringify(req.body));
            res.status(404);
            const error = new Error(4, "Invalid json format.");
            res.send(error);
            return;
        }
    }

    let returnJson = [];

    try{

        let selectRes = null;

        if(DeviceId==null)
           selectRes = await db.pool.query(selectResponsesFull,[CampaignId,CampaignId]);
        else 
        selectRes = await db.pool.query(selectResponsesDevice,[DeviceId,DeviceId]);

        for(let i = 0 ; i < selectRes.rowCount ; i++){

            const result = selectRes.rows[i];

            let resultJson = {};
            resultJson.QuestionText = result.questiontext;
            if(result.CustomAnswer == null)
            resultJson.AnswerText = result.answertext;
            else resultJson.AnswerText = result.CustomAnswer;
            resultJson.DeviceId = result.deviceid;
            resultJson.DeviceName = result.devicename;
            resultJson.Date = result.date;

            returnJson.push(resultJson);

        }

        res.status(200);
        res.send(returnJson);



    }catch(err){
        console.log(err);
        res.status(400);
        res.send({
            error: err
        });
        return;
    }

}

const updateDeviceDependent = "Update fadevice set dependentquestionid = $1 where deviceid = $2";
exports.addDependent = async function addDependent(req, res) {

    const {QuestionId,DeviceId} =req.body;
    
    try{

        const updateRes = db.pool.query(updateDeviceDependent,[QuestionId,DeviceId]);

        res.status(200);
        res.send({success:true});

    }catch(err){
        console.log(err);
        res.status(400);
        res.send({
            error: err
        });

    }


}


const selectDevicedependent = "Select dependentquestionid from fadevice where deviceid = $1";
const selectQuestion = "Select * From  Question q Where q.QuestionId = $1";
const selectAnswers = "Select a.* from Question q,Answer a,Question_Answer qa where q.QuestionID = qa.QuestionID and a.AnswerID = qa.AnswerID and q.QuestionID = $1";


exports.getDependent = async function getDependent(req, res) {

    const DeviceId =req.params.deviceId;
    
    try{

        const selectRes =await db.pool.query(selectDevicedependent,[DeviceId]);

        if( selectRes.rows[0].dependentquestionid==null){
            res.status(404);
            res.send({message:"Device does not have dependent question."});
            return;
        }
      ;

        const QuestionId = selectRes.rows[0].dependentquestionid;
        //------------------------------------------------------
        let responseJSON = {};
        const questions = [];
        const questionsRes = await db.pool.query(selectQuestion,[QuestionId]);

        let question = questionsRes.rows[0];
        const id = question.questionid;

        const questionJSON = {};
        questionJSON.QuestionId = question.questionid;
        questionJSON.QuestionType = question.questiontype;
        questionJSON.QuestionText = question.questiontext;
        questionJSON.IsDependent = question.isdependent;
        questionJSON.Data1 = question.data1;
        questionJSON.Data2 = question.data2;
        questionJSON.Data3 = question.data3;

        const answerRes = await db.pool.query(selectAnswers, [id]);

        const QuestionAnswers = [];

        for (let i = 0; i < answerRes.rowCount; i++) {
            let answer = answerRes.rows[i];
            QuestionAnswers.push({
                QuestionId: id,
                AnswerId: answer.answerid,
                Answer: {
                    AnswerId: answer.answerid,
                    AnswerText: answer.answertext,
                    IsAPicture: answer.isimage
                }
            });
        }
        questionJSON.QuestionAnswers = QuestionAnswers;
        questions.push(questionJSON);

  

        responseJSON.success = true;
        responseJSON.Questions = questions;
        res.send(responseJSON);
        return;


        res.status(200);
        res.send({Question});

    }catch(err){
        console.log(err);
        res.status(400);
        res.send({
            error: err
        });

    }


}