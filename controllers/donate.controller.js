const messageUtils = require('../utils/messageUtils');
const donateUtils = require('../utils/donateUtils');
require('dotenv').config();

module.exports = {
    send: async(client, message) => {
        let data = JSON.parse(message);

        let userId = data.userId;
        let added = data.added;
        let paymentId = data.paymentId;
        let user = await client.fetchUser(userId);
        let channel = client.channels.get(process.env.DONATE_LOG);
        var key;
        if(added) {
            let keyExists = true;
            let key;
            while(keyExists) {
                key = await donateUtils.generateKey();
                keyExists = await donateUtils.checkKey(this.client, key);
            }
            await donateUtils.saveCredit(client, {'userid': userId, 'key': key, 'paymentid': paymentId});
        }
        else {
            key = await donateUtils.removeCredit(client, paymentId);
        }
        
        let publicString;
        let privateString;

        if(added) {
            publicString =  `\`${user.tag}\` just purchased one month of premium. Key: \`${key}\``;
            privateString = `You have had one premium credit: \`${key}\` added to your account! Use the \`redeem\` command to get started!`;
        }
        else {
            publicString =  `\`${user.tag}\` just had a premium credited removed. Key: \`${key}\``;
            privateString = `You have had one premium credit removed: \`${key}\` added to your account! Use the \`redeem\` command to get started!`;
        }

        await messageUtils.sendCleanSuccess({
            target: channel, 
            valString: publicString,
            client: null
        });

        await messageUtils.sendCleanSuccess({
            target: user, 
            valString: privateString,
            client: null
        });
    }
};