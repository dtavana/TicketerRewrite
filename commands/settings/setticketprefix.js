const PremiumCommand  = require('../premium-command');
const messageUtils = require('../../utils/messageUtils');

module.exports = class SetTicketPrefixCommand extends PremiumCommand {
    constructor(client) {
        super(client, {
            name: 'setticketprefix',
            aliases: [],
            group: 'settings',
            memberName: 'setticketprefix',
            description: 'Sets the ticket prefix for a guild',
            guildOnly: true,
            userPermissions: ['MANAGE_GUILD'],
            args: [
                {
                    key: 'ticketprefix',
                    prompt: 'Please enter the desired ticket prefix',
                    type: 'string'
                }
            ]
        });
    }
    
    async run(msg, {ticketprefix}, fromPattern, result) {
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