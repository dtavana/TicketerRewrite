const redis = require('async-redis');
function init() {
    let db;
    db = redis.createClient();
    db.on('error',(err)=>{
        console.log('error',err);
        return err;
    });
    console.log('Redis connected');
    return db;
}

module.exports = init();
