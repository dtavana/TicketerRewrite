const votesUtils = require('../utils/votesUtils');
const donateUtils = require('../utils/donateUtils');
const messageUtils = require('../utils/messageUtils');

module.exports = {
    send: async(client, data, pg) => {
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

        if(receiveCredit) {
            let keyExists = true;
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

        const channel = client.channels.get(process.env.VOTES_LOG);
        const user = client.users.get(userId);
        let userString;
        let publicString;
        let privateString;
        if(user) userString = `\`${user.tag}\``;
        else userString = `\`${userId}\``;
        if(receiveCredit) {
            publicString = `${userString} just voted for Ticketer and received a premium credit with key \`${key}\``;
            privateString = `You have had one premium credit: \`${key}\` added to your account! Use the \`redeem\` command to get started! Thank you for voting for Ticketer!`;
        }
        else {
            publicString =  `${userString} just voted for Ticketer and has **${curVotes} vote(s)**`;
            privateString = `Thank you for voting for Ticketer! You currently have **${curVotes} vote(s)**. You need **${neededVotes - curVotes} vote(s)** to get a premium credit`;
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
