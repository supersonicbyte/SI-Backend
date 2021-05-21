const { Pool } = require('pg');
const pool;

if (process.env.DEBUG) {
    pool = new Pool({
        user: 'dbuser',
        host: 'database.server.com',
        database: 'mydb',
        password: 'secretpassword',
        port: 3211,
    })
} else {
    pool = new Pool({
        connectionString: "YOUR_URI_HERE",
        ssl: {
            rejectUnauthorized: false
        }
    });
}

module.exports = pool;