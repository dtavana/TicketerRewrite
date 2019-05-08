const TicketerCommand  = require('../ticketer-command');
const { User } = require('discord.js');
const messageUtils = require('../../utils/messageUtils');
const moderationUtils = require('../../utils/moderationUtils');

module.exports = class BlacklistCommand extends TicketerCommand {
    constructor(client) {
        super(client, {
            name: 'blacklist',
            aliases: ['block'],
            group: 'moderation',
            memberName: 'blacklist',
            description: 'Blacklist a user from creating a ticket',
            guildOnly: true,
            args: [
                {
                    key: 'target',
                    type: 'user',
                    prompt: 'Please tag the desired target to blacklist.'
                }
            ]
        });
    }
    
    async run(msg, {target}, fromPattern, result) {
        let hasRole = await this.checkTicketerRole(this.client, msg.member, msg.guild);
        if(!hasRole.state) {
            let adminRole = msg.member.roles.get(hasRole.admin);
            let moderatorRole = msg.member.roles.get(hasRole.moderator);
            if(!adminRole) {
                adminRole = "**NOT FOUND**";
            }
            else {
                adminRole = adminRole.toString()
            }
            if(!moderatorRole) {
                moderatorRole = "**NOT FOUND**";
            }
            else {
                moderatorRole = moderatorRole.toString()
            }
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: `In order to tag the user as the subject, you must have the ${adminRole} role or the ${moderatorRole} role. If you believe this is in error, make sure you have the role.`,
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }
        let blacklist = await moderationUtils.getBlacklisted(this.client, target, msg.guild);
        if(blacklist) {
            let banningAdmin = await this.client.users.get(blacklist.adminid);
            if(!banningAdmin) {
                banningAdmin = "**USER NOT FOUND**";
            }
            else {
                banningAdmin = banningAdmin.toString();
            }
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: `${target.toString()} has already been banned in **${msg.guild.name}** by ${banningAdmin}`,
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }
        await moderationUtils.blacklist(this.client, target, msg.guild, msg.author);
        return await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: `${target.toString()} has been blacklisted`,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });

    }
};