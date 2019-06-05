const PremiumCommand  = require('../premium-command');
const messageUtils = require('../../utils/messageUtils');

module.exports = class TicketOnJoinCommand extends PremiumCommand {
    constructor(client) {
        super(client, {
            name: 'ticketonjoin',
            aliases: ['setticketonjoin'],
            group: 'settings',
            memberName: 'ticketonjoin',
            description: 'Sets whether a ticket should be created on a user joining the guild',
            guildOnly: true,
            userPermissions: ['MANAGE_GUILD'],
            args: [
                {
                    key: 'ticketOnJoin',
                    prompt: 'Please enter **true** to turn this feature on and **false** to turn this feature off.',
                    type: 'boolean'
                }
            ]
        });
    }
    
    async run(msg, {ticketOnJoin}, fromPattern, result) {
        let res = await this.client.provider.set(msg.guild.id, 'ticketOnJoin', ticketOnJoin);
        let createdCategory;
        if(ticketOnJoin) {
            createdCategory = await msg.guild.channels.create(
                `New Member Ticket Category`,
                {
                    type: "category"
                }
            );
            await this.client.provider.set(msg.guild.id, 'ticketOnJoinCategory', createdCategory.id);
        }

        let resString;
        ticketOnJoin ? resString = `Old Ticket On Join: \`${res}\`\n\nNew Ticket On Join: \`${ticketOnJoin}\`\n\nJoin Ticket Category: \`${createdCategory.name}\`\n\nYou can rename this category but do not delete it.` : resString = `Old Ticket On Join: \`${res}\`\n\nNew Ticket On Join: \`${ticketOnJoin}\``;
        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: resString,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });

    }
};