const TicketerCommand = require('./ticketer-command');

module.exports = class PremiumCommand extends TicketerCommand {
    
    constructor(client, info) {
        super(client, info);
    }

    async checkPremium(client, msg) {
        let res = await client.provider.pg.oneOrNone("SELECT key FROM premium WHERE serverid = $1;", [msg.guild.id]);
        if(!res) {
            return false;
        }
        return true;
    }
    
    isUsable(message = null) {
		if(!message) return this._globalEnabled;
        if(this.guildOnly && message && !message.guild) return false;
        const hasPermission = this.hasPermission(message)
		return this.isEnabledIn(message.guild) && hasPermission && typeof hasPermission !== 'string';
	}
    
    hasPermission(message, ownerOverride = true) {
        let resStr;
		if(!this.ownerOnly && !this.userPermissions) return true;
		if(ownerOverride && this.client.isOwner(message.author)) return true;

        let premium;
        this.client.provider.pg.oneOrNone("SELECT key FROM premium WHERE serverid = $1;", [msg.guild.id])
            .then(res => premium = res)
        if(!premium) resStr = `This is a premium command. Please use the ${msg.guild.commandPrefix}upgrade command in order to purchase premium.`;
        else if(this.ownerOnly && (ownerOverride || !this.client.isOwner(message.author))) {
			resStr =  `The \`${this.name}\` command can only be used by the bot owner.`;
		}

		else if(message.channel.type === 'text' && this.userPermissions) {
			const missing = message.channel.permissionsFor(message.author).missing(this.userPermissions);
			if(missing.length > 0) {
				if(missing.length === 1) {
					resStr = `The \`${this.name}\` command requires you to have the "${permissions[missing[0]]}" permission.`;
				}
				resStr = oneLine`
					The \`${this.name}\` command requires you to have the following permissions:
					${missing.map(perm => permissions[perm]).join(', ')}
				`;
			}
        }
        
        if(resStr === null || resStr === undefined) {
            Promise.all(
                messageUtils.sendError({
                    target: msg.channel, 
                    valString: resStr,
                    client: this.client,
                    messages: [msg],
                    guild: msg.guild
                }),
                Promise.resolve(false)
            );
        }

		return true;
    }
}
