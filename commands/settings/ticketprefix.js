const PremiumCommand  = require('../premium-command');
const messageUtils = require('../../utils/messageUtils');

module.exports = class TicketPrefixCommand extends PremiumCommand {
    constructor(client) {
        super(client, {
            name: 'ticketprefix',
            aliases: ['setticketprefix'],
            group: 'settings',
            memberName: 'ticketprefix',
            description: 'Sets the ticket prefix for a guild',
            guildOnly: true,
            userPermissions: ['MANAGE_GUILD'],
            args: [
                {
                    key: 'ticketprefix',
                    prompt: 'Please enter the desired ticket prefix. **NOTE:** Must be less than 20 characters',
                    type: 'string'
                }
            ]
        });
    }
    
    async run(msg, {ticketprefix}, fromPattern, result) {
        if(ticketprefix.length > 20) {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: 'Ticket prefix must be under 2000 characters.',
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }
        let res = await this.client.provider.set(msg.guild.id, 'ticketprefix', ticketprefix);
        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: `Old Ticket Prefix: \`${res}\`\n\nNew Ticket Prefix: \`${ticketprefix}\``,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });

    }
};