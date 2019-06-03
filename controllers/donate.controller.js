const messageUtils = require('../utils/messageUtils');
const donateUtils = require('../utils/donateUtils');
const Discord = require('discord.js');
require('dotenv').config();

module.exports = {
    send: async(client, message) => {
        let data = JSON.parse(message);

        let userId = data.userId;
        let added = data.added;
        let paymentId = data.paymentId;
        let user = client.users.get(userId);
        let key;
        if(added) {
            let keyExists = true;
            let key;
            while(keyExists) {
                key = await donateUtils.generateKey();
                keyExists = await donateUtils.checkKey(client, key);
            }
            await donateUtils.saveCredit(client, {'userid': userId, 'key': key, 'paymentid': paymentId});
        }
        else {
            key = await donateUtils.removeCredit(client, paymentId);
        }
        
        let publicString;
        let privateString;

        if(added) {
            if(user) {
                publicString =  `\`${user.tag}\` just purchased one month of premium. Key: \`${key}\``;
            }
            else {
                publicString =  `\`${userId}\` just purchased one month of premium. Key: \`${key}\``;
            }
            
        }
        else {
            if(user) {
                publicString =  `\`${user.tag}\` just had a premium credited removed. Key: \`${key}\``;
            }
            else {
                publicString =  `\`${userId}\` just had a premium credited removed. Key: \`${key}\``;
            }
        }
        
        if(user) {
            if(added) {
                privateString = `You have had one premium credit: \`${key}\` added to your account! Use the \`redeem\` command to get started!`;
            }
            else {
                privateString = `You have had one premium credit removed: \`${key}\` added to your account! Use the \`redeem\` command to get started!`;
            }
            await messageUtils.sendCleanSuccess({
                target: user, 
                valString: privateString,
                client: null
            });
        }
    }
};