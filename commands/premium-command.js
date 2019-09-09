const TicketerCommand = require('./ticketer-command');
const { oneLine } = require('common-tags');

module.exports = class PremiumCommand extends TicketerCommand {
    
    constructor(client, info) {
        super(client, info);
    }
    
    hasPermission(message) {
        if(!this.client.provider.guilds.includes(message.guild.id)) {
            return `This is a premium command. Please use the \`${message.guild.commandPrefix}upgrade\` command in order to purchase premium.`;
        }
        
        if(this.ownerOnly && !this.client.isOwner(message.author)) {
            return `The \`${this.name}\` command can only be used by the bot owner.`;
        }

        if(message.channel.type === 'text' && this.userPermissions) {
            const permissions = message.channel.permissionsFor(message.member);
            const missing = permissions.missing(this.userPermissions);
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
