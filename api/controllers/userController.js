const db = require('../db/index');
const Error = require('../models/error.js');

const insertResponse = " Insert into UserResponse(QuestionID,AnswerID,CustomAnswer) values($1,$2,$3)";
exports.saveResponse = async function saveResponse(req, res) {
    const responses = req.body.UserResponses;
    if (responses == null) {
        console.log("GOT WRONG\n " + JSON.stringify(req.body));
        res.status(404);
        const error = new Error(4, "Invalid json format.");
        res.send(error);
        return;
    }
    for (let i = 0; i < responses.length; i++) {
        let response = responses[i];
        try {
            const insertRes = await db.pool.query(insertResponse, [response.QuestionId, response.AnswerId, response.CustomAnswer]);
            console.log("I GOT \n " + JSON.stringify(response));
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