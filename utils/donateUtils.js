const uuidv1 = require('uuid/v1');

module.exports = {
    generateKey: () => {
        let key = uuidv1();
        key = key.substring(0, key.indexOf('-'));
        return key;
    },
    saveCredit: async(client, options) => {
        await client.provider.pg.none("INSERT INTO premium (userid, key, paymentid) VALUES (${userid}, ${key}, ${paymentid});", options);
    },
    enableCredit: async(client, args) => {
        await client.provider.pg.none("UPDATE premium SET enabled = True, serverid = ${serverId} WHERE key = ${key}", args);
    },
    removeCredit: async(client, paymentId) => {
        let key = await client.provider.pg.one("SELECT key FROM premium WHERE paymentId = $1;", paymentId);
        await client.provider.pg.none("DELETE FROM premium WHERE paymentId = $1;", paymentId);
        return key;
    },
    getCredits: async(client, userId) => {
        let credits = await client.provider.pg.any("SELECT * FROM premium WHERE userid = $1;", [userId]);
        if(credits.length == 0) {
            return null;
        }
        return credits;
    }
}