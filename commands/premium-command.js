const TicketerCommand = require('./ticketer-command');
const { permissions } = require('discord.js-commando');
const { oneLine } = require('common-tags');

module.exports = class PremiumCommand extends TicketerCommand {
    
    constructor(client, info) {
        super(client, info);
    }

    async checkPremium(client, msg) {
        let res = await client.provider.pg.oneOrNone('SELECT key FROM premium WHERE serverid = $1;', [msg.guild.id]);
        if(!res) {
            return false;
        }
        return true;
    }
    
    hasPermission(message) {
        if(!this.client.provider.guilds.includes(message.guild.id)) {
            return `This is a premium command. Please use the \`${message.guild.commandPrefix}upgrade\` command in order to purchase premium.`;
        }
        
        if(this.ownerOnly && !this.client.isOwner(message.author)) {
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
