module.exports = {
    getPrefix: async function(guildid, redis) {
        res = await redis.hget(guildid, "prefix");
        return res;
    }
}