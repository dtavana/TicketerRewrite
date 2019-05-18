const StaffCommand  = require('../staff-command');
const messageUtils = require('../../utils/messageUtils');
const donateUtils = require('../../utils/donateUtils');

module.exports = class CreditsCommand extends StaffCommand {
    constructor(client) {
        super(client, {
            name: 'giftpremium',
            aliases: [],
            group: 'credits',
            memberName: 'giftpremium',
            description: 'Gift premium to a target',
            guildOnly: true,
            args: [
                {
                    key: 'target',
                    type: 'user',
                    prompt: 'Please tag the desired target to gift a credit to.'
                },
                {
                    key: 'amount',
                    type: 'integer',
                    prompt: 'Please enter the amount of credits to gift.',
                    default: 1
                },
                {
                    key: 'paymentId',
                    type: 'string',
                    prompt: 'Please enter the payment ID.',
                    default: 'gift'
                }
            ]
        });
    }
    
    async run(msg, {target, amount, paymentId}, fromPattern, result) {
        let collector = await messageUtils.sendWaiting({
            target: msg.channel, 
            valString: `Gift **${amount} credit(s)** to ${target.toString()}`,
            message: msg
        });
        collector.on('end', async(collected, reason) => {
            if(collected.has('✅')) {
                for (var i = 0; i < amount; i++) { 
                    let keyExists = true;
                    let key;
                    while(keyExists) {
                        key = await donateUtils.generateKey();
                        keyExists = await donateUtils.checkKey(this.client, key);
                    }
                    await donateUtils.saveCredit(this.client, {'userid': target.id, 'key': key, 'paymentid': paymentId});
                }
                await messageUtils.sendSuccess({
                    target: msg.channel, 
                    valString: `${target.toString()} has been given **${amount} credit(s)**`,
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