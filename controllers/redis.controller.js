const redis = require('async-redis');
function init() {
    let db;
    db = redis.createClient(process.env.REDIS_CONNECTION_STRING);
    db.on('error',(err)=>{
        console.log('error',err);
        return err;
    });
    console.log('Redis connected');
    return db;
}

module.exports = init();
