const myqsl = require('mysql2/promise');
async function mydb() {
    try {
        let connection = await myqsl.createConnection({
            host: process.env.TIDB_HOST,
            user: process.env.TIDB_USER,
            database: process.env.TIDB_DATABASE,
            password: process.env.TIDB_PASSWORD,
            port: process.env.TIDB_PORT,
            ssl: {}
        });
        console.log('data base is connected sucessful')
        return connection;
    } catch (error) {
        throw error
    }

}
const pool = myqsl.createPool({
    host: process.env.TIDB_HOST,
    user: process.env.TIDB_USER,
    database: process.env.TIDB_DATABASE,
    password: process.env.TIDB_PASSWORD,
    port: process.env.TIDB_PORT,
    ssl: {}
});

mydb.pool = pool;
module.exports = mydb;
