const TicketerCommand  = require('../ticketer-command');
const messageUtils = require('../../utils/messageUtils');
const ticketUtils = require('../../utils/ticketUtils');
const utils = require('../../utils/utils');

module.exports = class CloseAllCommand extends TicketerCommand {
    constructor(client) {
        super(client, {
            name: 'closeall',
            aliases: [],
            group: 'tickets',
            memberName: 'closeall',
            description: 'Closes all tickets',
            guildOnly: true,
            userPermissions: ['MANAGE_GUILD']
        });
    }
    
    async run(msg, fromPattern, result) {
        let collector = await messageUtils.sendWaiting({
            target: msg.channel, 
            valString: 'Close **ALL** Tickets',
            message: msg
        });
        let endReason;
        collector.on('end', async(collected) => {
            if(collected.has('✅')) {
                endReason = 'All tickets have been closed.';
                let allTickets = await this.client.provider.getSettings(`${msg.guild.id}-channels`);
                if(!allTickets) {
                    endReason = 'There are no tickets to close.';
                }
                else {
                    if(allTickets.size === 0) {
                        endReason = 'There are no tickets to close.';
                    }
                    else {
                        for(let channelid of Object.keys(allTickets)) {
                            let channel = await msg.guild.channels.resolve(channelid);
                            if(!channel) {
                                return;
                            }
                            let channelName = channel.name;
                            let data = await ticketUtils.closeTicket(this.client, msg.guild, channel, null);
                            if(typeof data === 'string') {
                                await messageUtils.sendError({
                                    target: msg.channel, 
                                    valString: data,
                                    client: this.client,
                                    messages: [msg].concat(result.prompts, result.answers),
                                    guild: msg.guild
                                });
                                await this.client.provider.pg.none('DELETE FROM inactive WHERE ticketid = $1;', channel.id);
                            }
                            else {
                                let closeReason = 'Closing all tickets.';
                                let createdAt = data.createdAt;
                                let originalAuthor = data.originalAuthor;
                                let channelHistory = data.channelHistory;
                                let authorObject = data.authorObject;
                                let subject = data.subject;
                                
                                let elapsedTime = Date.now() - createdAt;
                                let timeString = utils.timeConversion(elapsedTime);

                                await messageUtils.sendClosedTicket(this.client, channelName, originalAuthor, authorObject, closeReason, timeString, msg.guild, msg.author, channelHistory, subject);
                            }
                        }
                    }
                }

                await this.client.provider.redis.hdel(msg.guild.id, 'allTickets');
                return await messageUtils.sendSuccess({
                    target: msg.channel, 
                    valString: endReason,
                    client: this.client,
                    messages: [msg].concat(result.prompts, result.answers),
                    guild: msg.guild
                });
            }
            else {
                endReason = 'The current operation has been cancelled.';
                return await messageUtils.sendError({
                    target: msg.channel, 
                    valString: endReason,
                    client: this.client,
                    messages: [msg].concat(result.prompts, result.answers),
                    guild: msg.guild
                });
            }
        });
    }
};
