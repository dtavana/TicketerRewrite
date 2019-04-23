const TicketerCommand  = require('../ticketer-command');
const messageUtils = require('../../utils/messageUtils');
const { permissions } = require('discord.js-commando');
const donateUtils = require('../../utils/donateUtils');
const { oneLine } = require('common-tags');

module.exports = class RedeemCommand extends TicketerCommand {
    constructor(client) {
        super(client, {
            name: 'redeem',
            aliases: [],
            group: 'credits',
            memberName: 'redeem',
            description: 'Redeem an available premium credit',
            guildOnly: true,
            userPermissions: ['MANAGE_GUILD']
        });
    }
    
    async run(msg, fromPattern, result) {

        let premium = await this.checkPremium(this.client, msg);
        if(premium) {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: `This server already has premium enabled! If this is in error, join our support server using the \`${msg.guild.commandPrefix}support\` command.`,
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }
        let credits = await donateUtils.getCredits(this.client, msg.author.id);
        let filteredCredits;
        if(credits !== null) {
            filteredCredits = credits.filter(credit => !credit.enabled);
        }
        if(credits === null || filteredCredits.length == 0) {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: `You have no credits to redeem. Please use the \`${msg.guild.commandPrefix}upgrade\` command in order to purchase premium.`,
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }
        let credit = filteredCredits[0];
        await donateUtils.enableCredit(this.client, {
            serverId: msg.guild.id,
            key: credit.key
        });
        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: `**${msg.guild.name}** now has premium \`${credit.key}\` enabled. Take a look at \`${msg.guild.commandPrefix}help\` under the settings category in order to utilize premium fully!\n\nThank you for using Ticketer.`,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });
        this.client.provider.guilds.push(msg.guild.id);
    }

    hasPermission(message, ownerOverride = true) {
        if(this.client.provider.guilds.includes(message.guild.id)) {
            return `This guild already has premium enabled.`;
        }
        
        if(this.ownerOnly && (ownerOverride || !this.client.isOwner(message.author))) {
            return `The \`${this.name}\` command can only be used by the bot owner.`;
        }

        if(message.channel.type === 'text' && this.userPermissions) {
            const missing = message.channel.permissionsFor(message.author).missing(this.userPermissions);
            if(missing.length > 0) {
                if(missing.length === 1) {
                    return `The \`${this.name}\` command requires you to have the "${permissions[missing[0]]}" permission.`;
                }
                return oneLine`
					The \`${this.name}\` command requires you to have the following permissions:
					${missing.map(perm => permissions[perm]).join(', ')}
				`;
            }
        }

        return true;
    }
};