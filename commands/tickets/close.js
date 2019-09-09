const TicketerCommand  = require('../ticketer-command');
const messageUtils = require('../../utils/messageUtils');
const ticketUtils = require('../../utils/ticketUtils');
const utils = require('../../utils/utils');


module.exports = class CloseCommand extends TicketerCommand {
    constructor(client) {
        super(client, {
            name: 'close',
            aliases: [],
            group: 'tickets',
            memberName: 'close',
            description: 'Closes an existing ticket',
            guildOnly: true,
            args: [
                {
                    key: 'reason',
                    type: 'string',
                    prompt: 'Please enter the desired reason.',
                    default: false
                }
            ]
        });
    }
    
    async run(msg, {reason}, fromPattern, result) {
        let channelName = msg.channel.name;
        let data = await ticketUtils.closeTicket(this.client, msg.guild, msg.channel, msg.member);
        if(typeof data === 'string') {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: data,
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }
        await this.client.provider.pg.none('DELETE FROM inactive WHERE ticketid = $1;', msg.channel.id);

        if(!reason) {
            reason = 'None provided';
        }

        let createdAt = data.createdAt;
        let originalAuthor = data.originalAuthor;
        let channelHistory = data.channelHistory;
        let authorObject = data.authorObject;
        let subject = data.subject;
        
        let elapsedTime = Date.now() - createdAt;
        let timeString = utils.timeConversion(elapsedTime);

        await messageUtils.sendClosedTicket(this.client, channelName, originalAuthor, authorObject, reason, timeString, msg.guild, msg.author, channelHistory, subject);
        
    }
};