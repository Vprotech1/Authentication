const myqsl = require('mysql2/promise');
async function mydb() {
    try {
        let connection = await myqsl.createConnection({
            host: 'localhost',
            user: 'root',
            database: process.env.database,
            password: process.env.password
        });
        console.log('data base is connected sucessful')
        return connection;
    } catch (error) {
        throw error
    }

}
module.exports = mydb;
