const redis = require('async-redis');
require('dotenv').config();
var db;

function init() {
    db = redis.createClient();
    db.on('error',(err)=>{
        console.log("error",err);
        return err;
    });
    return db;
}

module.exports = init();
