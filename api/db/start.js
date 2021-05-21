const db = require('./index');

// runs on server start
const tableExists = "SELECT * FROM TEST";
const createTestTable = "CREATE TABLE TEST(NAME TEXT NOT NULL)";
const insertTest = "INSERT INTO TEST(NAME) VALUES ($1)";

module.exports.createDB = async function createDB() {
    try {
        const exist = await db.pool.query(tableExists);
        // table already exists
        if (exist) return;
    } catch (error) {
        console.log(error);
    }
    try {
        const res = await db.pool.query(createTestTable);
    } catch (error) {
        console.log(error);
    }
    try {
        const res1 = await db.pool.query(insertTest, ["hello"]);
    } catch (error) {
        console.log(err, res)
    }
}