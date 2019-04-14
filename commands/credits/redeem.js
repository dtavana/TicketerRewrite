const { Command }  = require('discord.js-commando')
const Discord = require('discord.js')
const messageUtils = require('../../utils/messageUtils')
const donateUtils = require('../../utils/donateUtils')

module.exports = class SetCleanAll extends Command {
	constructor(client) {
		super(client, {
			name: 'redeem',
			aliases: [],
			group: 'credits',
			memberName: 'redeem',
            description: 'Redeem an available premium credit',
            guildOnly: true,
            //TODO: Add validation for premium
		});
    }
    
    async run(msg, {cleanAll}) {
        let credits = await donateUtils.getCredits(this.client, msg.author.id);
        let filteredCredits = credits.filter(credit => !credit.enabled)
        if(filteredCredits.length == 0) {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: `You have no credits to redeem. Please use the ${msg.guild.commandPrefix}upgrade command in order to purchase premium.`,
                client: this.client,
                messages: [msg],
                guild: msg.guild
            });
        }
        let credit = filteredCredits[0];
        await donateUtils.enableCredit(this.client, {
            serverId: msg.guild.id,
            key: credit.key
        })
        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: `**${msg.guild.name}** now has premium \`${credit.key}\` enabled. Take a look at \`${msg.guild.commandPrefix}help\` under the settings category in order to utilize premium fully!\n\nThank you for using Ticketer.`,
            client: this.client,
            messages: [msg],
            guild: msg.guild
        });
    }
};