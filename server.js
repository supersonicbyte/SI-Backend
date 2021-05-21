const express = require('express');
const cors = require('cors');
const app = express();
const userRoutes = require('./api/routes/userRoutes');
const authRoutes = require('./api/routes/authRoutes');

app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => { res.send("<h1>Up and running.</h1>"); });

app.listen(3000, () => {
    console.log('Server uspješno pokrenut!')
});

// app.use('/user', userRoutes)
// app.use('/auth', authRoutes)