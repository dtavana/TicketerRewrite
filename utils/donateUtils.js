const uuidv1 = require('uuid/v1');

module.exports = {
    generateKey: () => {
        let key = uuidv1();
        key = key.substring(0, key.indexOf('-'));
        return key;
    },
    saveCredit: async(client, options) => {
        await client.provider.pg.none('INSERT INTO premium (userid, key, paymentid) VALUES (${userid}, ${key}, ${paymentid});', options);
    },
    saveVoteCredit: async(client, options) => {
        await client.provider.pg.none('INSERT INTO premium (userid, key, paymentid, expires) VALUES (${userid}, ${key}, ${paymentid}, date_trunc(\'day\', NOW() + interval \'1 minute\'));', options);
    },
    enableCredit: async(client, args) => {
        await client.provider.pg.none('UPDATE premium SET enabled = True, serverid = ${serverId} WHERE key = ${key}', args);
    },
    disableCredit: async(client, guildId) => {
        let key = await client.provider.pg.one('SELECT key FROM premium WHERE serverid = $1;', [guildId]);
        key = key.key;
        await client.provider.pg.none('UPDATE premium SET enabled = False, serverid = 0 WHERE key = $1;', [key]);
        return key;
    },
    transferCredit: async(client, key, userId) => {
        await client.provider.pg.none('UPDATE premium SET userid = $1 WHERE key = $2;', [userId, key]);
    },
    removeCredit: async(client, paymentId) => {
        let key = await client.provider.pg.one('SELECT key FROM premium WHERE paymentid = $1;', paymentId);
        await client.provider.pg.none('DELETE FROM premium WHERE paymentId = $1;', paymentId);
        return key;
    },
    checkKey: async(client, key) => {
        let exists = await client.provider.pg.oneOrNone('SELECT * FROM premium WHERE key = $1;', key);
        if(exists === null) {
            return false;
        }
        return true;
    },
    removeCreditFromKey: async(client, key) => {
        await client.provider.pg.none('DELETE FROM premium WHERE key = $1;', key);
    },
    getCredits: async(client, userId) => {
        let credits = await client.provider.pg.any('SELECT * FROM premium WHERE userid = $1;', [userId]);
        if(credits.length == 0) {
            return null;
        }
        return credits;
    },
    getOpenCredit: async(client, userId) => {
        let credits = await client.provider.pg.any('SELECT * FROM premium WHERE userid = $1 AND enabled = False;', [userId]);
        if(credits.length == 0) {
            return null;
        }
        return credits[0];
    },
    getCreditOwner: async(client, serverId) => {
        let userId = await client.provider.pg.oneOrNone('SELECT userid FROM premium WHERE serverid = $1;', [serverId]);
        return userId;
    }
};