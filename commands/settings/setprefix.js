const { Command } = require('discord.js-commando')
const Discord = require('discord.js')
const messageUtils = require('../../utils/messageUtils')

module.exports = class SetPrefix extends Command {
	constructor(client) {
		super(client, {
			name: 'setprefix',
			aliases: [],
			group: 'settings',
			memberName: 'setprefix',
            description: 'Sets the prefix for a guild',
            guildOnly: true,
            //TODO: Add validation for premium
            args: [
                {
                    key: 'prefix',
                    prompt: 'Please enter the desired prefix',
                    type: 'string'
                }
            ]
		});
    }
    
    async run(msg, {prefix}) {
        let res = await this.client.provider.set(msg.guild.id, "prefix", prefix);
        msg.guild.commandPrefix = prefix;
        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: `Old Prefix: \`${res}\`\n\nNew Prefix: \`${prefix}\``,
            client: this.client,
            messages: [msg],
            guild: msg.guild
        });

    }
};