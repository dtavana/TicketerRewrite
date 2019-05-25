const TicketerCommand  = require('../ticketer-command');
const messageUtils = require('../../utils/messageUtils');

module.exports = class StatsCommand extends TicketerCommand {
    constructor(client) {
        super(client, {
            name: 'stats',
            aliases: [],
            group: 'info',
            memberName: 'stats',
            description: 'Displays information about the stats of this guild and Ticketer.'
        });
    }
    
    async run(msg, fromPattern, result) {
        let openTickets = await this.client.provider.get(msg.guild, 'openTickets', null);
        let closedTickets = await this.client.provider.get(msg.guild, 'closedTickets', null);
        let allOpenTickets = await this.client.provider.redis.get('allOpenTickets');
        let handledTickets = await this.client.provider.redis.get('handledTickets');

        if(!allOpenTickets) {
            allOpenTickets = 0;
        }
        if(!openTickets) {
            openTickets = 0;
        }
        if(!closedTickets) {
            closedTickets = 0;
        }
        if(!handledTickets) {
            handledTickets = 0;
        }

        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: `Since Version 2, the following stats have been recorded:\n\nIn this guild, there are currently **${openTickets} Open Tickets** and **${closedTickets} Handled Tickets**.\n\nGlobally, there are currently **${allOpenTickets} Open Tickets** and **${handledTickets} Handled Tickets**.`,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });
    }
};