const TicketerCommand  = require('../ticketer-command');
const messageUtils = require('../../utils/messageUtils');

module.exports = class RemoveCommand extends TicketerCommand {
    constructor(client) {
        super(client, {
            name: 'remove',
            aliases: [],
            group: 'tickets',
            memberName: 'remove',
            description: 'Removes a user from an existing ticket',
            guildOnly: true,
            args: [
                {
                    key: 'target',
                    type: 'member',
                    prompt: 'Please tag the desired user to add to the ticket.'
                },
                {
                    key: 'channel',
                    type: 'channel',
                    prompt: 'Please tag the desired ticket channel.',
                    default: false
                }
            ]
        });
    }
    
    async run(msg, {target, channel}, fromPattern, result) {
        if(!channel) channel = msg.channel;
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
        let hasAdmin = await this.checkTicketerRole(this.client, msg.member, msg.guild);
        if(!hasAdmin.state && msg.author.id !== ticketOwner) {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: `In order to remove a user from a ticket, you must have the ${hasAdmin.admin} role, the ${hasAdmin.moderator} role, or be the owner of the ticket`,
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }
        let checkTargetRole = await this.checkTicketerRole(this.client, target, msg.guild);
        if(target.id === ticketOwner || checkTargetRole.state || target.user.bot) {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: `You are not permitted to remove ${target.toString()}`,
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }

        await channel.updateOverwrite(target, {
            'SEND_MESSAGES': false,
            'VIEW_CHANNEL': false,
            'EMBED_LINKS': false,
            'ATTACH_FILES': false
        },
        'Adding user to a Ticketer Channel'
        );
        
        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: `${target.toString()} has been removed from ${channel.toString()}`,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });
        await messageUtils.sendTicketManipulation(
            this.client,
            msg.guild,
            msg.author,
            target,
            channel.name,
            'RED',
            `\`${msg.author.tag}\` removed \`${target.user.tag}\` from \`${channel.name}\``
        );
    }
};