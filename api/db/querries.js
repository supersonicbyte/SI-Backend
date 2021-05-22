
const db = require('./index');

async function activateDevice(req, res) {

    const installation_code = req.params.code;

    const selectDevice = "Select fa.DeviceName, fa.DeviceId, fa.CampaignID from FADevice fa where fa.InstallationCode = $1";
    // const updateDevice = "Update FADevice set InstallationCode = null where DeviceId = $1";

    try{

        const selectRes = await db.pool.query(selectDevice, [installation_code]);

        // const updateRes = await db.pool.query(updateDevice, [selectRes.rows[0].deviceid]);

        const response = {Name: selectRes.rows[0].devicename, DeviceId:selectRes.rows[0].deviceid,CampaignID:selectRes.rows[0].campaignid};

        console.log(response);

        res.status(200);
        res.send(response);
        
    }catch(err){

        console.log("Error");

        res.status(404);
        res.send({error:err});

    }

}

async function getCampaign(req, res) {


    try{

    const responseJSON = {};

    const campaign_id = req.params.campaignid;

    const selectCampaign = "Select c.* From Campaign c Where c.CampaignID=$1";

    const campaignRes = await db.pool.query(selectCampaign, [campaign_id]);

    responseJSON.CampaignID = campaignRes.rows[0].campaignid;
    responseJSON.Name = campaignRes.rows[0].name;
    responseJSON.StartDate = campaignRes.rows[0].startdate;
    responseJSON.EndDate = campaignRes.rows[0].enddate;


    const selectQuestion = "Select q.* From Campaign c, Question q Where c.CampaignID = q.CampaignID and c.CampaignID=$1";

    const selectAnswers = `Select a.* from Question q,Answer a,Question_Answer qa where q.QuestionID = qa.QuestionID and a.AnswerID = qa.AnswerID and q.QuestionID = $1`;


    const questionsRes = await db.pool.query(selectQuestion, [campaign_id]);

    const questions = [];

    var bar = new Promise((resolve, reject) => {
        

         questionsRes.rows.forEach(async (question, index, array) => {
            
            const id = question.questionid;
    
            const questionJSON = {};
            questionJSON.QuestionID = question.questionid;
            questionJSON.QuestionType = question.questiontype;
            questionJSON.QuestionText = question.questiontext;
            questionJSON.IsDependent = question.isdependent;
            questionJSON.Data1 = question.data1;
            questionJSON.Data2 = question.data2;
            questionJSON.Data3 = question.data3;
    
            const answerRes = await db.pool.query(selectAnswers,[id]);
    
            const QuestionAnswers = [];
    
            answerRes.rows.forEach(async answer => {
    
                QuestionAnswers.push({AnswerId:answer.answerid,Answer:{
                    AnswerText:answer.answertext,
                    IsAPicture:answer.isimage
                }});
    
    
            });
    
            questionJSON.QuestionAnswers = QuestionAnswers;
    
    
            questions.push(questionJSON);

            if (index === array.length-1) resolve();
    
            });


    });

    bar.then(() => {
        responseJSON.Questions = questions;
        console.log(responseJSON);
        res.send(responseJSON);
        return;
    });


    }catch(err){
        console.log("Error in getCampaign", err);
        res.status(404);
        res.send({error:err});
    }

}

async function saveResponse(req, res) {


    const insertResponse =  " Insert into UserResponse(QuestionID,AnswerID,CustomAnswer) values($1,$2,$3)";

    const response = req.body.UserResponses;

    try{

    const insertRes = await db.pool.query(insertResponse, [response[0].QuestionId,response[0].AnswerId,response[0].CustomAnswer]);

    res.status(200);
    res.send({success:true});

    }catch(err){
        console.log("Error in saveResponse", err);
        res.status(400);
        res.send({error:err});
    }
   

}








module.exports = {
    activateDevice,
    getCampaign,
    saveResponse
}