const express = require('express');
const cors = require('cors');
const app = express();
const pool = require('./api/db/db');

app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(cors());


// runs on server start
const createTestTable = "CREATE TABLE TEST(NAME TEXT NOT NULL)";
const insertTest = "INSERT INTO TEST(NAME) VALUES (hello)";
const res = await pool.query(createTestTable, (err, res) => {
    console.log(err, res)
    client.end()
});
const res1 = await pool.query(insertTest, (err, res) => {
    console.log(err, res)
    client.end()
})

app.get('/', (req, res) => { res.send("<h1>Up and running.</h1>"); });

app.get('/test', (req, res) => {
    pool.query('SELECT * FROM TEST')
        .then(res => res.send(res.rows[0]))
        .catch(e => console.error(e.stack))
});

app.listen(3000, () => {
    console.log('Server uspješno pokrenut!')
});

// app.use('/user', userRoutes)
// app.use('/auth', authRoutes)