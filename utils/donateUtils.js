const uuidv1 = require('uuid/v1');

module.exports = {
    generateKey: async() => {
        let key = uuidv1();
        key = key.substring(0, key.indexOf('-'));
        console.log(key);
        return key;
    },
    saveCredit: async(client, options) => {
        await client.provider.pg.none("INSERT INTO premium (userid, key, paymentid) VALUES (${userId}, ${key}, ${paymentid});", options);
    },
    removeCredit: async(client, paymentId) => {
        let key = await client.provider.pg.one("SELECT key FROM premium WHERE paymentId = $1;", paymentId);
        await client.provider.pg.none("DELETE FROM premium WHERE paymentId = $1;", paymentId);
        return key;
    }
}