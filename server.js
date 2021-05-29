const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./api/db/index.js');
const DBStartHelper = require('./api/db/start');
const port = process.env.PORT || 3000;
const campaignRoutes = require('./api/routes/campaignRoutes');
const questionRoutes = require('./api/routes/questionRoutes');
const answerRoutes = require('./api/routes/answerRoutes');

const querries = require('./api/db/querries');

DBStartHelper.resetDB().then(() => {
    DBStartHelper.createDB().then(() => {
        DBStartHelper.fillDB();
    });
});

app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(cors());
/**
 * ROUTES
 */
app.use('/api/campaign', campaignRoutes);
app.use('/api/question', questionRoutes);
app.use('/api/answer', answerRoutes);


app.get('/api/device/activate/:code', querries.activateDevice);



app.post('/api/response/save', querries.saveResponse);



//app.post('/api/answer/add', querries.addAnswer);

app.get('/', (req, res) => { res.send("<h1>Up and running.</h1>"); });

app.get('/api/reset/data', (req, res) => {
    try {
        DBStartHelper.fillDB();
        res.status(200);
        res.send("Ok");
    } catch (err) {
        console.log(err);
        res.status(404);
        res.send("Not Ok");
    }
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