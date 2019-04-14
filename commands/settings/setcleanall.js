const PremiumCommand  = require('../premium-command')
const Discord = require('discord.js')
const messageUtils = require('../../utils/messageUtils')

module.exports = class SetCleanAll extends PremiumCommand {
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
        let premium = await this.checkPremium(this.client, msg);
        if(!premium) {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: `This is a premium command. Please use the ${msg.guild.commandPrefix}upgrade command in order to purchase premium.`,
                client: this.client,
                messages: [msg],
                guild: msg.guild
            });
        }
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