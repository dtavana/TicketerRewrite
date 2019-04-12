const messageUtils = require('../utils/messageUtils');
require('dotenv').config();

module.exports = {
    send: async(client, message) => {
        let data = JSON.parse(message);

        let userId = message.userId;
        let isWeekend = message.isWeekend;
        //TODO: check if user should receive credit
        //let receiveCredit = message.receiveCredit;
        //TODO: get current votes
        //let curVotes = ;
        let neededVotes = Number(process.env.NEEDED_VOTES);

        let user = client.fetchUser(userId);
        let channel = client.channels.get(process.env.VOTES_CHANNEL);

        let publicString;
        let privateString;

        if(receivedCredit) {
            publicString =  `${user.tag} just voted for Ticketer and received a premium credit!`;
            privateString = `You have just received a premium credit! Your votes have been reset. Thank you for voting for Ticketer!`;
        }
        else {
            publicString = `${user.tag} just voted for Ticketer!`
            privateString = `Thank you for voting for Ticketer! You currently have **${curVotes} vote(s)**. You need **${neededVotes - curVotes}** vote(s) to get a premium credit.`;
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