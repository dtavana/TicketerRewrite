const pgp = require('pg-promise')();
const db = pgp(process.env.PG_CONNECTION_STRING);

function init() {
    db.connect()
        .then(obj=>{
            console.log('Postgres Connected');
            obj.done();
        })
        .catch(err=>{
            console.log('Postgres Error Connecting');
            console.log(err);
        }); 
    return db;
}

module.exports = init();