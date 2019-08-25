const votesController = require('./votes.controller');
const donateController = require('./donate.controller');

module.exports = {
    handleIncomingMessage: async(client, channel, message) => {
        switch(channel) {
        case process.env.VOTE_CHANNEL:
            await votesController.send(client, message);
            break;
        case process.env.DONATE_CHANNEL:
            await donateController.send(client, message);
            break;
        }
    }
};