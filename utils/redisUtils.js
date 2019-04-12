require('dotenv').config();
const subpubController = require('../controllers/subpub.controller')

module.exports = {
    setFetch: async(client, guildId, key, newValue) => {
        let oldValue = await client.redis.hget(guildId, key);
        let setRes = await client.redis.hset(guildId, key, newValue);
        if(oldValue === null) {
            oldValue = "Not Set";
        }
        return {
            oldValue: oldValue,
            setRes: setRes
        };
    },
    set: async(client, guildId, key, newValue) => {
        let res = await client.redis.hset(guildId, key, newValue);
        return res;
    },
    fetch: async(client, guildId, key) => {
        let value = await client.redis.hget(guildId, key);
        return value;
    },
    initSub: async(client, redis) => {
        redis.on('message', async(channel, message) => {
            await subpubController.handleIncomingMessage(client, channel, message)
        });
        console.log("Initialized Redis onmessage event.")
        
        redis.subscribe(process.env.VOTE_CHANNEL, (err, count) => {
            if(err) {
                throw new Error(error);
            }
            console.log(`Subscribed to the ${channel} channel.`);
        })

        redis.subscribe(process.env.DONATE_CHANNEL, (err, count) => {
            if(err) {
                throw new Error(error);
            }
            console.log(`Subscribed to the ${channel} channel.`);
        })

        redis.subscribe(process.env.API_GUILD_CHANNEL, (err, count) => {
            if(err) {
                throw new Error(error);
            }
            console.log(`Subscribed to the ${channel} channel.`);
        })

        redis.subscribe(process.env.API_TICKET_CHANNEL, (err, count) => {
            if(err) {
                throw new Error(error);
            }
            console.log(`Subscribed to the ${channel} channel.`);
        })

        console.log("Done initializing Redis Sub Pipeline.")
    }
}