const messageUtils = require('../utils/messageUtils');
const votesUtils = require('../utils/votesUtils');
const donateUtils = require('../utils/donateUtils');
const pg = require('./postgres.controller');
require('dotenv').config();

module.exports = {
    send: async(manager, data) => {
        let votesToAdd;
        let isWeekend = data.isWeekend;
        isWeekend ? votesToAdd = 2 : votesToAdd = 1;
        let userId = data.user;
        
        let curVotes = await votesUtils.getVotes(pg, userId);
        if(curVotes === false) {
            curVotes = 0;
            await pg.none('INSERT INTO votes (userid, count) VALUES ($1, 0);', [userId]);
        }
        curVotes += votesToAdd;
        let neededVotes = parseInt(process.env.NEEDED_VOTES);
        let receiveCredit = curVotes >= neededVotes;
        let finalVotes;
        let key;

        let publicString;
        let privateString;

        if(receiveCredit) {
            let keyExists = true;
            key;
            while(keyExists) {
                key = await donateUtils.generateKey();
                keyExists = await donateUtils.checkKey(pg, key);
            }
            await donateUtils.saveVoteCredit(pg, {'userid': userId, 'key': key, 'paymentid': 'voting'}); 
            finalVotes = curVotes - neededVotes; 
        }
        else {
            finalVotes = curVotes;
        }
        await pg.none('UPDATE votes SET count = $1 WHERE userid = $2;', [finalVotes, userId]);

        await manager.broadcastEval(`
            const messageUtils = require('../../../../utils/messageUtils');
            const channel = this.channels.get('${process.env.VOTES_LOG}');
            const user = this.users.get('${userId}');
            let userString;
            if(user) userString = '\`' + user.tag + '\`';
            else userString = '\`${userId}\`';
            let publicString;
            let privateString;
            if(${receiveCredit}) {
                publicString = userString + ' just voted for Ticketer and received a premium credit with key \`${key}\`';
                privateString = 'You have had one premium credit: \`${key}\` added to your account! Use the \`redeem\` command to get started! Thank you for voting for Ticketer!';
            }
            else {
                publicString =  userString + ' just voted for Ticketer and has **${curVotes} vote(s)**';
                privateString = 'Thank you for voting for Ticketer! You currently have **${curVotes} vote(s)**. You need **${neededVotes - curVotes} vote(s)** to get a premium credit';
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