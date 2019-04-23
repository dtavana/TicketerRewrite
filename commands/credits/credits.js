const TicketerCommand  = require('../ticketer-command')
const Discord = require('discord.js')
const messageUtils = require('../../utils/messageUtils')
const donateUtils = require('../../utils/donateUtils')

module.exports = class SetCleanAll extends TicketerCommand {
	constructor(client) {
		super(client, {
			name: 'credits',
			aliases: [],
			group: 'credits',
			memberName: 'credits',
            description: 'View all credits',
            guildOnly: true,
		});
    }
    
    async run(msg, {cleanAll}, fromPattern, result) {
        let credits = await donateUtils.getCredits(this.client, msg.author.id);
        let filteredCredits = credits.filter(credit => !credit.enabled)
        if(credits === null) {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: `You have no credits. Please use the ${msg.guild.commandPrefix}upgrade command in order to purchase premium.`,
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }
        let embedStr = "";
        for(let credit of credits) {
            let tempStr = "";
            tempStr = `**Key:** \`${credit.key}\` | **Enabled:** \`${credit.enabled}\``
            if(credit.enabled) {
                tempStr += ` | **ServerID:** \`${credit.serverid}\``
            }
            tempStr += "\n";
            embedStr += tempStr;
        }
        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: embedStr,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });
    }
};