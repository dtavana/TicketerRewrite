require('dotenv').config();
const initializationOptions = {
    error(err,e) {
        if(e.cn) console.log('connection error',error.message);
        if(e.query){
            console.log('query wahala',e.query);
            if(e.params) console.log('query error',e.params);
        }
        if(e.ctx) console.log('transaction error',e.ctx);

    }
}
const pgp = require('pg-promise')(initializationOptions);
const db = pgp(process.env.PG_CONNECTION_STRING);

function init() {
    db.connect()
        .then(obj=>{
            console.log('Postgres Connected');
            obj.done();
        })
        .catch(err=>{
            console.log('Postgres Error Connecting');
        }) 
    return db;
}

module.exports = init();