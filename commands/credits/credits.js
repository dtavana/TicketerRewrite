const TicketerCommand  = require('../ticketer-command');
const messageUtils = require('../../utils/messageUtils');
const donateUtils = require('../../utils/donateUtils');

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
    
    async run(msg, fromPattern, result) {
        let credits = await donateUtils.getCredits(this.client, msg.author.id);
        if(credits === null) {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: `You have no credits. Please use the ${msg.guild.commandPrefix}upgrade command in order to purchase premium.`,
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }
        let embedStr = '';
        for(let credit of credits) {
            let tempStr = '';
            tempStr = `**Key:** \`${credit.key}\` | **Enabled:** \`${credit.enabled}\``;
            if(credit.enabled) {
                tempStr += ` | **ServerID:** \`${credit.serverid}\``;
            }
            tempStr += '\n';
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