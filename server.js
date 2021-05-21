const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./api/db/index.js');
const DBStartHelper = require('./api/db/start');

DBStartHelper.createDB();

app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(cors());


app.get('/', (req, res) => { res.send("<h1>Up and running.</h1>"); });

app.get('/test', async(req, res) => {
    try {
        const result = await db.pool.query('SELECT * FROM TEST');
        res.send(result.rows[0])
    } catch (error) {
        console.log(error);
        res.send("Error");
    }
});

app.listen(3000, () => {
    console.log('Server uspješno pokrenut!')
});