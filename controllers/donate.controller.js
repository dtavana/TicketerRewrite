const messageUtils = require('../utils/messageUtils');
const donateUtils = require('../utils/donateUtils');
const Discord = require('discord.js');
const pg = require('./postgres.controller');

module.exports = {
    send: async(manager, message) => {
        let data = JSON.parse(message);

        let userId = data.userId;
        let added = data.added;
        let paymentId = data.paymentId;
        let key;
        if(added) {
            let keyExists = true;
            let key;
            while(keyExists) {
                key = await donateUtils.generateKey();
                keyExists = await donateUtils.checkKey(pg, key);
            }
            await donateUtils.saveCredit(pg, {'userid': userId, 'key': key, 'paymentid': paymentId});
        }
        else {
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
                publicString = userString + ' just purchased one month of premium. Key: \`${key}\`';
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
        `)
    }
};