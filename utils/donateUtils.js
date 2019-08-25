const uuidv1 = require('uuid/v1');
const { CommandoClient } = require('discord.js-commando');

module.exports = {
    generateKey: () => {
        let key = uuidv1();
        key = key.substring(0, key.indexOf('-'));
        return key;
    },
    saveCredit: async(client, options) => {
        let db;
        if(client instanceof CommandoClient) db = client.provider.pg;
        else db = client;
        await db.none('INSERT INTO premium (userid, key, paymentid) VALUES (${userid}, ${key}, ${paymentid});', options);
    },
    saveVoteCredit: async(client, options) => {
        let db;
        if(client instanceof CommandoClient) db = client.provider.pg;
        else db = client;
        await db.none('INSERT INTO premium (userid, key, paymentid, expires) VALUES (${userid}, ${key}, ${paymentid}, date_trunc(\'day\', NOW() + interval \'1 month\'));', options);
    },
    enableCredit: async(client, args) => {
        let db;
        if(client instanceof CommandoClient) db = client.provider.pg;
        else db = client;
        await db.none('UPDATE premium SET enabled = True, serverid = ${serverId} WHERE key = ${key}', args);
    },
    disableCredit: async(client, guildId) => {
        let db;
        if(client instanceof CommandoClient) db = client.provider.pg;
        else db = client;
        let key = await db.one('SELECT key FROM premium WHERE serverid = $1;', [guildId]);
        key = key.key;
        await db.none('UPDATE premium SET enabled = False, serverid = 0 WHERE key = $1;', [key]);
        return key;
    },
    transferCredit: async(client, key, userId) => {
        let db;
        if(client instanceof CommandoClient) db = client.provider.pg;
        else db = client;
        await db.none('UPDATE premium SET userid = $1 WHERE key = $2;', [userId, key]);
    },
    removeCredit: async(client, paymentId) => {
        let db;
        if(client instanceof CommandoClient) db = client.provider.pg;
        else db = client;
        let key = await db.any('SELECT key FROM premium WHERE paymentid = $1;', paymentId);
        await db.none('DELETE FROM premium WHERE paymentId = $1;', paymentId);
        key.length == 0 ? key = "Not Found" : key = key[0].key;
        return key;
    },
    checkKey: async(client, key) => {
        let db;
        if(client instanceof CommandoClient) db = client.provider.pg;
        else db = client;
        let exists = await db.oneOrNone('SELECT * FROM premium WHERE key = $1;', key);
        if(exists === null) {
            return false;
        }
        return true;
    },
    removeCreditFromKey: async(client, key) => {
        let db;
        if(client instanceof CommandoClient) db = client.provider.pg;
        else db = client;
        await db.none('DELETE FROM premium WHERE key = $1;', key);
    },
    getCredits: async(client, userId) => {
        let db;
        if(client instanceof CommandoClient) db = client.provider.pg;
        else db = client;
        let credits = await db.any('SELECT * FROM premium WHERE userid = $1;', [userId]);
        if(credits.length == 0) {
            return null;
        }
        return credits;
    },
    getOpenCredit: async(client, userId) => {
        let db;
        if(client instanceof CommandoClient) db = client.provider.pg;
        else db = client;
        let credits = await db.any('SELECT * FROM premium WHERE userid = $1 AND enabled = False;', [userId]);
        if(credits.length == 0) {
            return null;
        }
        return credits[0];
    },
    getCreditOwner: async(client, serverId) => {
        let db;
        if(client instanceof CommandoClient) db = client.provider.pg;
        else db = client;
        let userId = await db.oneOrNone('SELECT userid FROM premium WHERE serverid = $1;', [serverId]);
        return userId;
    }
};