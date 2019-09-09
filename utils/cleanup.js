const messageUtils = require('./messageUtils');
const ticketUtils = require('./ticketUtils');
const utils = require('./utils');

module.exports = {
    cleanExpiredCredits: async(client, pg) => {
        let expiredCredits = await pg.any('SELECT * FROM premium WHERE expires < NOW();');
        for(let credit of expiredCredits) {
            let userId = credit.userid;
            let serverid = credit.serverid;
            if(serverid) {
                await client.provider.clear(serverid);
                await client.provider.clear(`${serverid}-channels`);
            }
            await pg.none('DELETE FROM premium WHERE key = $1;', credit.key);
            let user = client.users.get(userId);
            if(!user) return;
            else {
                await messageUtils.sendCleanSuccess({
                    target: user, 
                    valString: `Your vote credit with key \`${credit.key}\` has expired and premium has been removed from its server if it was enabled.`,
                });
            }
        }
    },

    cleanInactiveTickets: async(client, pg) => {
        let expiredChannels = await pg.any('SELECT * FROM inactive WHERE expires < NOW();');
        for(let ticket of expiredChannels) {
            let channelId = ticket.ticketid;
            let guildId = ticket.serverid;
            let channel = client.channels.get(channelId);
            await pg.none('DELETE FROM inactive WHERE ticketid = $1', channelId);
            if(!channel) continue;
            let guild = client.guilds.get(guildId);
            if(!guild) continue;
            let channelName = channel.name;
            let data = await ticketUtils.closeInactiveTicket(client, guild, channel);
            if(!data) continue;
            let createdAt = data.createdAt;
            let originalAuthor = data.originalAuthor;
            let channelHistory = data.channelHistory;
            let authorObject = data.authorObject;
            let subject = data.subject;
            let elapsedTime = Date.now() - createdAt;
            let timeString = utils.timeConversion(elapsedTime);
            await messageUtils.sendClosedTicket(client, channelName, originalAuthor, authorObject, 'Inactive Ticket', timeString, guild, client.user, channelHistory, subject);
        }
    }
};