const donateUtils = require('../utils/donateUtils');
const pg = require('./postgres.controller');

module.exports = {
    send: async(manager, data) => {
        const { status, txn_id: paymentId } = data;
        let userId = data.buyer_id;
        const prefixText = 'nonrole:';
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

        await manager.broadcastEval(`
            const messageUtils = require('../../../../utils/messageUtils');
            const channel = this.channels.get('${process.env.DONATE_LOG}');
            const user = this.users.get('${userId}');
            let userString;
            if(user) userString = '\`' + user.tag + '\`';
            else userString = '\`${userId}\`';
            let publicString;
            let privateString;
            if(${added}) {
                publicString = userString + ' just purchased premium. Key: \`${key}\`';
                privateString = 'You have had one premium credit: \`${key}\` added to your account! Use the \`redeem\` command to get started!';
            }
            else {
                publicString =  userString + ' just had a premium credited removed. Key: \`${key}\`';
                privateString = 'You have had one premium credit removed: \`${key}\` added to your account! Use the \`redeem\` command to get started!';
            }
            if(!!channel) {
                messageUtils.sendCleanSuccess({
                    target: channel, 
                    valString: publicString,
                    client: null
                }).then();
            }
            if(!!user) {
                messageUtils.sendCleanSuccess({
                    target: user, 
                    valString: privateString,
                    client: null
                }).then();
            }
        `);
    }
};