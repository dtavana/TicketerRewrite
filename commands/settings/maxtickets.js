const PremiumCommand  = require('../premium-command');
const messageUtils = require('../../utils/messageUtils');

module.exports = class MaxTicketsCommand extends PremiumCommand {
    constructor(client) {
        super(client, {
            name: 'maxtickets',
            aliases: ['setmaxtickets'],
            group: 'settings',
            memberName: 'maxtickets',
            description: 'Sets the maximum amount of tickets for a user to have open at once',
            guildOnly: true,
            userPermissions: ['MANAGE_GUILD'],
            args: [
                {
                    key: 'maxTickets',
                    prompt: 'Please enter the desired number of tickets a user can have open at once. **NOTE:** `-1` is unlimited tickets',
                    type: 'integer'
                }
            ]
        });
    }
    
    async run(msg, {maxTickets}, fromPattern, result) {
        let res = await this.client.provider.set(msg.guild.id, 'maxTickets', maxTickets);
        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: `Old Max Tickets: \`${res}\`\n\nNew Max Tickets: \`${maxTickets}\``,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });

    }
};