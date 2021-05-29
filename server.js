const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./api/db/index.js');
const DBStartHelper = require('./api/db/start');
const port = process.env.PORT || 3000;
const campaignRoutes = require('./api/routes/campaignRoutes');
const questionRoutes = require('./api/routes/questionRoutes');
const answerRoutes = require('./api/routes/answerRoutes');
const deviceRoutes = require('./api/routes/deviceRoutes');
const userRoutes = require('./api/routes/userRoutes');

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
app.use('/api/device', deviceRoutes);
app.use('/api/user', userRoutes);

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

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});