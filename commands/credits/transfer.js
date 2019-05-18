const TicketerCommand  = require('../ticketer-command');
const messageUtils = require('../../utils/messageUtils');
const donateUtils = require('../../utils/donateUtils');

module.exports = class CreditsCommand extends TicketerCommand {
    constructor(client) {
        super(client, {
            name: 'transfer',
            aliases: [],
            group: 'credits',
            memberName: 'transfer',
            description: 'Transfer a credit to a user',
            guildOnly: true,
            args: [
                {
                    key: 'target',
                    type: 'user',
                    prompt: 'Please tag the desired target to transfer your credit to.'
                }
            ]
        });
    }
    
    async run(msg, {target}, fromPattern, result) {
        if(msg.author.id === target.id) {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: `You can not transfer a credit to yourself.`,
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }
        let credit = await donateUtils.getOpenCredit(this.client, msg.author.id);
        if(credit === null) {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: `You have no credits. Please use the ${msg.guild.commandPrefix}upgrade command in order to purchase premium.`,
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }
        let collector = await messageUtils.sendWaiting({
            target: msg.channel, 
            valString: `Transfer credit to ${target.toString()}`,
            message: msg
        });
        collector.on('end', async(collected, reason) => {
            if(collected.has('✅')) {
                await donateUtils.transferCredit(this.client, credit.key, target.id);
                await messageUtils.sendSuccess({
                    target: msg.channel, 
                    valString: `Credit with key \`${credit.key}\` has been transfered to ${target.toString()}`,
                    client: this.client,
                    messages: [msg].concat(result.prompts, result.answers),
                    guild: msg.guild
                });
            }
            else {
                return await messageUtils.sendError({
                    target: msg.channel, 
                    valString: `The current operation has been cancelled.`,
                    client: this.client,
                    messages: [msg].concat(result.prompts, result.answers),
                    guild: msg.guild
                });
            }
        });
    }
};