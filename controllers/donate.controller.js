const donateUtils = require('../utils/donateUtils');
const messageUtils = require('../utils/messageUtils');

module.exports = {
    send: async(client, data, pg) => {
        const { status, txn_id: paymentId } = data;
        let userId = data.buyer_id;
        const prefixText = 'non-role:';
        const rolePrefix = userId.indexOf(prefixText);
        if(rolePrefix !== -1) {
            userId = userId.substring(prefixText.length);
        }
        let added = true;
        let key;
        if(status === 'completed') {
            let keyExists = true;
            while(keyExists) {
                key = await donateUtils.generateKey();
                keyExists = await donateUtils.checkKey(pg, key);
            }
            await donateUtils.saveCredit(pg, {'userid': userId, 'key': key, 'paymentid': paymentId});
        }
        else {
            added = false;
            key = await donateUtils.removeCredit(pg, paymentId);
        }
        const channel = client.channels.get(process.env.DONATE_LOG);
        const user = client.users.get(userId);
        let userString;
        if(user) userString = `\`${user.tag}\``;
        else userString = `\`${userId}\``;
        let publicString;
        let privateString;
        if(added) {
            publicString = `${userString}  just purchased premium. Key: \`${key}\``;
            privateString = `You have had one premium credit: \`${key}\` added to your account! Use the \`redeem\` command to get started!`;
        }
        else {
            publicString =  `${userString} just had a premium credited removed. Key: \`${key}\``;
            privateString = `You have had one premium credit removed: \`${key}\` from your account.`;
        }
        if(channel) {
            await messageUtils.sendCleanSuccess({
                target: channel,
                valString: publicString,
                client: null
            });
        }
        if(user) {
            await messageUtils.sendCleanSuccess({
                target: user,
                valString: privateString,
                client: null
            });
        }
    }
};
