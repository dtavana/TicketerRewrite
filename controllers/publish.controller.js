const redis = require('async-redis');
var db;

function init() {
    db = redis.createClient();
    db.on('error',(err)=>{
        console.log('error',err);
        return err;
    });
    return db;
}

module.exports = init();
