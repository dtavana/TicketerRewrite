const { Command } = require('discord.js-commando')
const Discord = require('discord.js')
const messageUtils = require('../../utils/messageUtils')

module.exports = class SetCleanAll extends Command {
	constructor(client) {
		super(client, {
			name: 'setcleanall',
			aliases: [],
			group: 'settings',
			memberName: 'setcleanall',
            description: 'Sets whether the bot should delete all invocations of commands (`true`: On**, `false`: Off**)',
            guildOnly: true,
            //TODO: Add validation for premium
            args: [
                {
                    key: 'cleanAll',
                    prompt: 'Sets whether the bot should delete all invocations of commands (`true`: On**, `false`: Off**)',
                    type: 'boolean'
                }
            ]
		});
    }
    
    async run(msg, {cleanAll}) {
        let res = await this.client.provider.set(msg.guild.id, "cleanAll", cleanAll);
        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: `Old Clean All: \`${res}\`\n\nNew Clean All: \`${cleanAll}\``,
            client: this.client,
            messages: [msg],
            guild: msg.guild
        });

    }
};