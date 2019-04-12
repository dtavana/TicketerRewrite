const messageUtils = require('../utils/messageUtils');
const donateUtils = require('../utils/donateUtils');
require('dotenv').config();

module.exports = {
    send: async(client, message) => {
        let data = JSON.parse(message);

        let userId = message.userId;
        let added = message.added;
        let paymentId = message.paymentId;
        let user = client.fetchUser(userId);
        let channel = client.channels.get(process.env.DONATE_CHANNEL);
        if(added) {
            let key = donateUtils.generateKey();
            await donateUtils.saveCredit(client, {"userId": userId, "key": key, "paymentId": paymentId});
        }
        else {
            let key = await donateUtils.removeCredit(client, {"paymentId": paymentId});
        }
        
        let publicString;
        let privateString;

        if(added) {
            publicString =  `${user.tag} just purchased one month of premium. Key: \`${key}\``;
            privateString = `You have had one premium credit: \`${key}\` added to your account! Use the \`redeem\` command to get started!`;
        }
        else {
            publicString =  `${user.tag} just had a premium credited removed. Key: \`${key}\``;
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
}