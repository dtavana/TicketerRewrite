module.exports = {
    setFetch: async(client, guildId, key, newValue) => {
        let oldValue = await client.provider.redis.hget(guildId, key);
        let setRes = await client.provider.redis.hset(guildId, key, newValue);
        if(oldValue === null) {
            oldValue = 'Not Set';
        }
        return {
            oldValue: oldValue,
            setRes: setRes
        };
    },
    set: async(client, guildId, key, newValue) => {
        let res = await client.provider.redis.hset(guildId, key, newValue);
        return res;
    },
    fetch: async(client, guildId, key) => {
        let value = await client.provider.redis.hget(guildId, key);
        return value;
    }
};