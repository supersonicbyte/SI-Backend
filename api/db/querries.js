const { json } = require('body-parser');
const db = require('./index');
var dateFormat = require("dateformat");

async function activateDevice(req, res) {

    const installation_code = req.params.code;

    const selectDevice = "Select fa.DeviceName, fa.DeviceId, fa.CampaignID from FADevice fa where fa.InstallationCode = $1";
    // const updateDevice = "Update FADevice set InstallationCode = null where DeviceId = $1";

    try {

        const selectRes = await db.pool.query(selectDevice, [installation_code]);

        // const updateRes = await db.pool.query(updateDevice, [selectRes.rows[0].deviceid]);

        const response = { Name: selectRes.rows[0].devicename, DeviceId: selectRes.rows[0].deviceid, CampaignID: selectRes.rows[0].campaignid };

        console.log(response);

        res.status(200);
        res.send(response);

    } catch (err) {

        res.status(404);
        res.send({ error: err, message: "Error activating device" });

    }

}

async function getCampaignOld(req, res) {


    try {

        const responseJSON = {};

        const campaign_id = req.params.campaignid;

        const selectCampaign = "Select c.* From Campaign c Where c.CampaignID=$1";

        const campaignRes = await db.pool.query(selectCampaign, [campaign_id]);

        responseJSON.CampaignID = campaignRes.rows[0].campaignid;
        responseJSON.Name = campaignRes.rows[0].name;
        responseJSON.StartDate = dateFormat(campaignRes.rows[0].startdate, "dd-mm-yyyy")
        responseJSON.EndDate = dateFormat(campaignRes.rows[0].enddate, "dd-mm-yyyy")

        const selectQuestion = "Select q.* From Campaign c, Question q Where c.CampaignID = q.CampaignID and c.CampaignID=$1";

        const selectAnswers = `Select a.* from Question q,Answer a,Question_Answer qa where q.QuestionID = qa.QuestionID and a.AnswerID = qa.AnswerID and q.QuestionID = $1`;


        const questionsRes = await db.pool.query(selectQuestion, [campaign_id]);

        const questions = [];

        var bar = await new Promise((resolve, reject) => {


            questionsRes.rows.forEach(async(question, index, array) => {

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


                var bar2 = new Promise((resolve, reject) => {

                    answerRes.rows.forEach(async(answer, index2, array2) => {

                        QuestionAnswers.push({
                            QuestionId: id,
                            AnswerId: answer.answerid,
                            Answer: {
                                AnswerId: answer.answerid,
                                AnswerText: answer.answertext,
                                IsAPicture: answer.isimage
                            }
                        });

                        if (index2 === array2.length - 1) resolve();

                    });

                });

                questionJSON.QuestionAnswers = QuestionAnswers;
                questions.push(questionJSON);


                if (index === array.length - 1) resolve();

            });




        });

        responseJSON.Questions = questions;
        res.send(responseJSON);
        return;

    } catch (err) {
        res.status(404);
        res.send({ error: err, message: "Error getting campaign" });
    }

}

async function getCampaign(req, res) {


    try {

        const responseJSON = {};

        const campaign_id = req.params.campaignid;

        const selectCampaign = "Select c.* From Campaign c Where c.CampaignID=$1";

        const campaignRes = await db.pool.query(selectCampaign, [campaign_id]);

        if (campaignRes.rowCount === 0) {
            res.status(404);
            res.send({ success: false, error_id: 4, message: "Invalid campagin id." });
            return;
        }

        responseJSON.CampaignID = campaignRes.rows[0].campaignid;
        responseJSON.Name = campaignRes.rows[0].name;
     /*   responseJSON.StartDate = dateFormat(campaignRes.rows[0].startdate, "dd-mm-yyyy")
        responseJSON.EndDate = dateFormat(campaignRes.rows[0].enddate, "dd-mm-yyyy")*/
        responseJSON.StartDate = campaignRes.rows[0].startdate;
        responseJSON.enddate = campaignRes.rows[0].enddate;

        const selectQuestion = "Select q.* From Campaign c, Question q Where c.CampaignID = q.CampaignID and c.CampaignID=$1";

        const selectAnswers = `Select a.* from Question q,Answer a,Question_Answer qa where q.QuestionID = qa.QuestionID and a.AnswerID = qa.AnswerID and q.QuestionID = $1`;

        const questions = [];

        const questionsRes = await db.pool.query(selectQuestion, [campaign_id]);



        for (let i = 0; i < questionsRes.rowCount; i++) {
            let question = questionsRes.rows[i];
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
        }
        responseJSON.Questions = questions;
        res.send(responseJSON);
        return;

    } catch (err) {
        console.log(err);
        res.status(404);
        res.send({ error: err, message: "Error getting campaign" });
    }

}

async function saveResponse(req, res) {


    const insertResponse = " Insert into UserResponse(QuestionID,AnswerID,CustomAnswer) values($1,$2,$3)";

    const responses = req.body.UserResponses;


    for (let i = 0; i < responses.rowCount; i++) {

        let response = responses.rows[i];

        try {
            
            const insertRes = await db.pool.query(insertResponse, [response[0].QuestionId, response[0].AnswerId, response[0].CustomAnswer]);
            

        } catch (err) {
           
        }

    }

    res.status(200);
    res.send({ success: true });


}

//dole je novo
async function editQuestion(req, res) {

    //ovo se odnosi da se edituje tekst pitanja, njegov tip ili data
    //tj samo ce primiti json pitanja i spasiti ga u bazu

    const { QuestionId, QuestionType, QuestionText, IsDependent, Data1, Data2, Data3 } = req.body;

    if (QuestionId == null || QuestionType == null || QuestionText == null || IsDependent == null) {
        res.status(300);
        res.send({ error: "Wrong json format" });
        return;
    }

    const updateQuestion = " Update question set  questiontype=$1, questiontext=$2,isdependent=$3,data1=$4,data2=$5,data3=$6 where questionid = $7";
    //obicni update bla bla bla

    try {

        const updateRes = await db.pool.query(updateQuestion, [QuestionType, QuestionText, IsDependent, Data1, Data2, Data3, QuestionId]);
        res.status(200);
        res.send({ success: true });

    } catch (err) {

        res.status(400);
        res.send({ error: err, message: "Error editing question" });
        return;
    }

}

async function addAnswer(req, res) {


    const { QuestionId, Answer } = req.body;

    if (QuestionId == null || Answer == null || Answer.AnswerText == null || Answer.IsAPicture == null) {
        res.status(300);
        res.send({ error: "Wrong json format" });
        return;
    }

    const insertAnswer = "Insert into answer(answertext,isimage) values ($1,$2) Returning *";
    const insertQuestionAnswer = "Insert into question_answer(questionid,answerid) values ($1,$2)";
    //prvo doda answer u svoju tabelu
    //pa onda questionid-answerid u question_answer tabelu
    try {

        const insertRes = await db.pool.query(insertAnswer, [Answer.AnswerText, Answer.IsAPicture], async function(err, result, fields) {

            if (err) {
                res.status(350);
                res.send({ errror: err });
                return;
            } else {
                const AnswerId = result.rows[0].answerid;
                const insertRes = await db.pool.query(insertQuestionAnswer, [QuestionId, AnswerId]);
                res.status(200);
                res.send({ success: true });
            }
        });



    } catch (err) {
        res.status(400);
        res.send({ error: err, message: "Error adding answer" });
        return;
    }


}

async function deleteQuestion(req, res) {

    const id = req.body.QuestionId;


    if (id == null) {
        res.status(300);
        res.send({ error: "Wrong json format" });
        return;
    }

    const deleteQuestion1 = " Delete from question_answer where questionid = $1";

    const selectAnswers = "Select answerid from question_answer where questionid=$1";
    const deleteAnswer = "Delete from answer where answerid = $1";

    const deleteQuestion2 = " Delete from question where questionid = $1";

    const deleteUserResponse = "Delete from userResponse where questionid = $1";


    //vjerovatno moze i sa delete cascade da obrise iz zavisnih tabela ali ovako mi je sigurnije

    try {

        const deleteUserRes = await db.pool.query(deleteUserResponse, [id]);
        //prvo brise sve responseve vezane za ovo pitanje jer nema smisla da ih ostavi (plus foreign key)

        const selectRes = await db.pool.query(selectAnswers, [id]);
        //odabere sve odgovore vezane za to pitanje

        const deleteRes1 = await db.pool.query(deleteQuestion1, [id]);
        //obrise sve veze pitanje-odgovor 

        var bar = await new Promise((resolve, reject) => {


            selectRes.rows.forEach(async(answer, index, array) => {
                await db.pool.query(deleteAnswer, [answer.answerid]);
                if (index === array.length - 1) resolve();
            });

        });
        //obrise sve odgovore, vjerovatno sam mogao stavit where id is in (...) pa staviit niz id-ova ali ne znam kako iskreno



        const deleteRes2 = await db.pool.query(deleteQuestion2, [id]);
        //obrise na kraju to pitanje

        res.status(200);
        res.send({ success: true });
        return;


    } catch (err) {

        res.status(400);
        res.send({ error: err, message: "Error deleting question" });
        return;

    }


}

async function addQuestion(req, res) {

    const { CampaignID, QuestionType, QuestionText, IsDependent, Data1, Data2, Data3 } = req.body;

    if (CampaignID == null || QuestionType == null || QuestionText == null || IsDependent == null) {
        res.status(300);
        res.send({ error: "Wrong json format" });
        return;
    }

    const insertQuestion = "Insert into question(QuestionType,QuestionText,IsDependent,Data1,Data2,Data3,CampaignId) values($1,$2,$3,$4,$5,$6,$7)";
    //obicni insert upit, primi sve podatke i samo doda
    try {
        const insertRes = await db.pool.query(insertQuestion, [QuestionType, QuestionText, IsDependent, Data1, Data2, Data3, CampaignID]);
        res.status(200);
        res.send({ success: true });

    } catch (err) {
        res.status(400);
        res.send({ error: err, message: "Error adding question" });
        return;
    }


}

async function editCampaign(req, res) {

    const { CampaignId, Name, StartDate, EndDate } = req.body;

    if (CampaignId == null || Name == null || StartDate == null || EndDate == null) {
        res.status(300);
        res.send({ error: "Wrong json format" });
        return;
    }

    const updateCampaign = " Update campaign set name=$1,startdate=To_Date($2, 'dd-mm-yyyy'),enddate=To_Date($3, 'dd-mm-yyyy') where campaignid = $4";
    //obicni update upit, primi sve podatke i samo ih updatea
    try {

        const updateRes = await db.pool.query(updateCampaign, [Name, StartDate, EndDate, CampaignId]);
        //const updateRes = await db.pool.query(updateCampaign, [Name,CampaignId]);
        res.status(200);
        res.send({ success: true });

    } catch (err) {

        res.status(400);
        res.send({ error: err, message: "Error editing campaign" });
        return;

    }



}

async function deleteCampaign(req, res) {

    const { CampaignId } = req.body;

    if (CampaignId == null) {
        res.status(300);
        res.send({ error: "Wrong json format" });
        return;
    }

    const deleteCampaign = "Delete from Campaign where CampaignId = $1";
    //ovo nece raditi jer treba dodati cascade u foreign keys nemam blage kako to ide neka neko vidi i doda

    try {

        const updateRes = await db.pool.query(deleteCampaign, [CampaignId]);
        res.status(200);
        res.send({ success: true });

    } catch (err) {
        res.status(400);
        res.send({ error: err, message: "Error deleting campaign" });
        return;
    }


}



module.exports = {
    activateDevice,
    getCampaign,
    saveResponse,
    deleteQuestion,
    editQuestion,
    addAnswer,
    editCampaign,
    addQuestion,
    deleteCampaign
}