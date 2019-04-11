const { Command } = require('discord.js-commando')
const Discord = require('discord.js')
const messageUtils = require('../../utils/messageUtils')
const redisUtils = require('../../utils/redisUtils')

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
        let res = await redisUtils.setFetch(this.client, msg.guild.id, "prefix", prefix);
        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: `Old Prefix: \`${res.oldValue}\`\n\nNew Prefix: \`${prefix}\``,
            client: this.client,
            messages: [msg],
            guild: msg.guild
        });

    }
};