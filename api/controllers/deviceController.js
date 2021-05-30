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
        if(response.AnswerId == -1)response.AnswerId=null;
        try {
            const insertRes = await db.pool.query(insertResponse, [response.QuestionId, response.AnswerId, response.CustomAnswer]);
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