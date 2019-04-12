require('dotenv').config();
const votesController = require('./votes.controller')
const donateController = require('./donate.controller')
const guildController = require('./guild.controller')
const ticketController = require('./ticket.controller')

module.exports = {
    handleIncomingMessage: async(client, channel, message) => {
        switch(channel) {
            case process.env.VOTE_CHANNEL:
                await votesController.send(client, message)
                break;
            case process.env.DONATE_CHANNEL:
                await donateController.send(client, message)
                break;
            /*
                case process.env.API_GUILD_CHANNEL:
                await guildController.send(client, message)
                break;
            case process.env.API_TICKET_CHANNEL:
                await ticketController.send(client, message)
                break;
            */

        }
    }
}