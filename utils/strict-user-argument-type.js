const { escapeMarkdown } = require('discord.js');
const { ArgumentType } = require('discord.js-commando');

class StrictUserArgumentType extends ArgumentType {
	constructor(client) {
		super(client, 'strictuser');
	}

	async validate(val, msg, arg) {
		const matches = val.match(/^(?:<@!?)?([0-9]+)>?$/);
		if(matches) {
			try {
				const user = await msg.client.users.fetch(matches[1]);
				if(!user) return false;
				if(arg.oneOf && !arg.oneOf.includes(user.id)) return false;
				return true;
			} catch(err) {
				return false;
			}
		}
		
	}
	parse(val, msg) {
		const matches = val.match(/^(?:<@!?)?([0-9]+)>?$/);
		if(matches) return msg.client.users.get(matches[1]) || null;
	}
}

module.exports = StrictUserArgumentType;