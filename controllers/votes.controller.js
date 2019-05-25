const messageUtils = require('../utils/messageUtils');
const votesUtils = require('../utils/votesUtils');
const donateUtils = require('../utils/donateUtils');
require('dotenv').config();

module.exports = {
    send: async(client, message) => {
        let data = JSON.parse(message);
        let votesToAdd;
        let isWeekend = data.isWeekend;
        isWeekend ? votesToAdd = 2 : votesToAdd = 1;
        let userId = data.userId;
        
        let curVotes = await votesUtils.getVotes(client, userId);
        if(curVotes === null) {
            curVotes = 0;
            await client.provider.pg.none('INSERT INTO votes (userid, count) VALUES ($1, 0);', [userId]);
        }
        curVotes += votesToAdd;
        let neededVotes = parseInt(process.env.NEEDED_VOTES);
        let receiveCredit = curVotes >= neededVotes;
        let finalVotes;

        let user = await client.fetchUser(userId);
        let channel = client.channels.get(process.env.VOTES_LOG);

        let publicString;
        let privateString;

        if(receiveCredit) {
            let keyExists = true;
            let key;
            while(keyExists) {
                key = await donateUtils.generateKey();
                keyExists = await donateUtils.checkKey(this.client, key);
            }
            await donateUtils.saveVoteCredit(client, {'userid': userId, 'key': key, 'paymentid': 'voting'}); 
            publicString =  `\`${user.tag}\` just voted for Ticketer and received a premium credit!`;
            privateString = `You have had one premium credit: \`${key}\` added to your account! Use the \`redeem\` command to get started! Thank you for voting for Ticketer!`;
            finalVotes = curVotes - neededVotes;
            
        }
        else {
            publicString = `\`${user.tag}\` just voted for Ticketer!`;
            privateString = `Thank you for voting for Ticketer! You currently have **${curVotes} vote(s)**. You need **${neededVotes - curVotes} vote(s)** to get a premium credit.`;
            finalVotes = curVotes;
        }
        await client.provider.pg.none('UPDATE votes SET count = $1 WHERE userid = $2;', [finalVotes, userId]);

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