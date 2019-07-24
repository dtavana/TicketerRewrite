const PremiumCommand  = require('../premium-command');
const messageUtils = require('../../utils/messageUtils');

module.exports = class ActiveCommand extends PremiumCommand {
    constructor(client) {
        super(client, {
            name: 'active',
            aliases: ['setactive'],
            group: 'tickets',
            memberName: 'active',
            description: 'Marks a ticket as active',
            guildOnly: true
        });
    }
    
    async run(msg, fromPattern, result) {
        let channel = msg.channel;
        let ticketData = await this.client.provider.get(`${msg.guild.id}-channels`, channel.id, null);
        if(!ticketData) {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: `${channel.toString()} is not detected as a ticket channel`,
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }
        ticketData = JSON.parse(ticketData);
        let ticketOwner = ticketData.author;
        ticketOwner = this.client.users.get(ticketOwner);

        await this.client.provider.pg.none("DELETE FROM inactive WHERE ticketid = $1;", channel.id);
        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: `${channel.toString()} has been marked as active again`,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });
        await messageUtils.sendSuccess({
            target: ticketOwner, 
            valString: `\`${channel.name}\` in **${msg.guild.name}** has been marked as active again`,
            client: this.null
        });
        await messageUtils.sendTicketManipulation(
            this.client,
            msg.guild,
            msg.author,
            null,
            channel.name,
            'GREEN',
            `\`${channel.name}\` has been marked as active again`
        );
    }
};