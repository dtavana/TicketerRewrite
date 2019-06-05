const TicketerCommand  = require('../ticketer-command');
const messageUtils = require('../../utils/messageUtils');

module.exports = class UpgradeCommand extends TicketerCommand {
    constructor(client) {
        super(client, {
            name: 'upgrade',
            aliases: ['premium'],
            group: 'info',
            memberName: 'upgrade',
            description: 'Displays information on how to purchase premium.'
        });
    }
    
    async run(msg, fromPattern, result) {
        let res = 'Premium is a one-time $20 fee. Click here to [purchase premium](https://donatebot.io/checkout/542717934104084511).';
        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: res,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });
    }
};