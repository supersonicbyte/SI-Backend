const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./api/db/index.js');
const DBStartHelper = require('./api/db/start');
const port = process.env.PORT || 3000;

const querries = require('./api/db/querries');

DBStartHelper.createDB();

app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(cors());

app.get('/api/device/activate/:code',querries.activateDevice);

app.get('/api/campaign/:campaignid',querries.getCampaign);

app.post('/api/response/save',querries.saveResponse);

app.get('/', (req, res) => { res.send("<h1>Up and running.</h1>"); });

app.get('/api/reset/data', (req, res) => {
    DBStartHelper.fillDB();
});

app.get('/api/reset/db', (req, res) => {
    DBStartHelper.resetDB();
});

app.get('/test', async(req, res) => {
    try {
        const result = await db.pool.query('SELECT * FROM TEST');
        res.send(result.rows[0])
    } catch (error) {
        console.log(error);
        res.send("Error");
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});