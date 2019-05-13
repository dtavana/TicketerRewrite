const TicketerCommand  = require('../ticketer-command');
const messageUtils = require('../../utils/messageUtils');
const ticketUtils = require('../../utils/ticketUtils');

module.exports = class AddCommand extends TicketerCommand {
    constructor(client) {
        super(client, {
            name: 'add',
            aliases: [],
            group: 'tickets',
            memberName: 'add',
            description: 'Adds a user to an existing ticket',
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
        let ticketOwner = await this.client.provider.get(`${msg.guild.id}-channels`, channel.id, null);
        if(!ticketOwner) {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: `${channel.toString()} is not detected as a ticket channel`,
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }
        let hasAdmin = await this.checkTicketerRole(this.client, msg.member, msg.guild);
        if(!hasAdmin.state && msg.author.id !== ticketOwner) {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: `In order to add a user to a ticket, you must have the ${hasAdmin.admin} role, the ${hasAdmin.moderator} role, or be the owner of the ticket`,
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }
        let checkTargetRole = await this.checkTicketerRole(this.client, target, msg.guild);
        if(target.id === ticketOwner || checkTargetRole.state || channel.permissionsFor(target).has('SEND_MESSAGES')) {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: `${target.toString()} already has access to ${channel.toString()}`,
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }
        if(target.user.bot) {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: `You may not add bots to a ticket channel`,
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }

        await channel.updateOverwrite(target, {
            'SEND_MESSAGES': true,
            'VIEW_CHANNEL': true,
            'EMBED_LINKS': true,
            'ATTACH_FILES': true
            },
            "Adding user to a Ticketer Channel"
        );
        
        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: `${target.toString()} has been added to ${channel.toString()}`,
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
            'GREEN',
            `\`${msg.author.tag}\` added \`${target.user.tag}\` to \`${channel.name}\``
        );
    }
};