const { Command } = require('discord.js-commando');
const messageUtils = require('../utils/messageUtils');

module.exports = class TicketerCommand extends Command {
    constructor(client, info) {
        super(client, info);
    }

    onError(err, message, args, fromPattern, result) {
		const owners = this.client.owners;
		const ownerList = owners ? owners.map((usr, i) => {
			const or = i === owners.length - 1 && owners.length > 1 ? 'or ' : '';
			return `${or}${escapeMarkdown(usr.username)}#${usr.discriminator}`;
		}).join(owners.length > 2 ? ', ' : ' ') : '';

		const invite = this.client.options.invite;
        let resStr = stripIndents`
            An error occurred while running the command: \`${err.name}: ${err.message}\`
            You shouldn't ever receive an error like this.
            Please contact ${ownerList || 'the bot owner'}${invite ? ` in this server: ${invite}` : '.'}
            `
        let res;
        messageUtils.sendError({
            target: msg.channel, 
            valString: resStr,
            client: this.client,
            messages: [msg],
            guild: msg.guild
        })
            .then(result =>  res = result)
        return res;
    }

    onBlock(message, reason, data) {
        let resStr;
        switch(reason) {
			case 'guildOnly':
				resStr = `The \`${this.name}\` command must be used in a server channel.`;
			case 'nsfw':
				resStr = `The \`${this.name}\` command can only be used in NSFW channels.`;
			case 'permission': {
				if(data.response) resStr = data.response;
                else resStr = `You do not have permission to use the \`${this.name}\` command.`;
			}
			case 'clientPermissions': {
				if(data.missing.length === 1) {
					resStr = `I need the "${permissions[data.missing[0]]}" permission for the \`${this.name}\` command to work.`
				}
                else {
                    resStr = oneLine`
                        I need the following permissions for the \`${this.name}\` command to work:
                        ${data.missing.map(perm => permissions[perm]).join(', ')}
                        `
                }
			}
			case 'throttling': {
				resStr = `You may not use the \`${this.name}\` command again for another ${data.remaining.toFixed(1)} seconds.`
			}
			default:
                resStr =  null;
        }
        if(resStr === null) return null;
        let res;
        messageUtils.sendError({
            target: msg.channel, 
            valString: resStr,
            client: this.client,
            messages: [msg],
            guild: msg.guild
        })
            .then(result =>  res = result)
        return resStr;
        
	}

}