const TicketerCommand  = require('../ticketer-command');
const messageUtils = require('../../utils/messageUtils');
const moderationUtils = require('../../utils/moderationUtils');

module.exports = class UnblacklistCommand extends TicketerCommand {
    constructor(client) {
        super(client, {
            name: 'unblacklist',
            aliases: ['unblock'],
            group: 'moderation',
            memberName: 'unblacklist',
            description: 'Removes a user from the blacklist',
            guildOnly: true,
            args: [
                {
                    key: 'target',
                    type: 'user',
                    prompt: 'Please tag the desired target to remove from the blacklist.'
                }
            ]
        });
    }
    
    async run(msg, {target}, fromPattern, result) {
        let hasRole = await this.checkTicketerRole(this.client, msg.member, msg.guild);
        if(!hasRole.state) {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: `In order to unblacklist a user, you must have the ${hasRole.admin} role or the ${hasRole.moderator} role. If you believe this is in error, make sure you have the role.`,
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }
        let blacklist = await moderationUtils.getBlacklisted(this.client, target, msg.guild);
        if(!blacklist) {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: `${target.toString()} is currently not blacklisted in **${msg.guild.name}**`,
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }
        await moderationUtils.unblacklist(this.client, target, msg.guild);
        return await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: `${target.toString()} has been removed from the blacklist`,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });

    }
};