const TicketerCommand  = require('../ticketer-command');
const messageUtils = require('../../utils/messageUtils');

module.exports = class SupportCommand extends TicketerCommand {
    constructor(client) {
        super(client, {
            name: 'support',
            aliases: ['supportserver'],
            group: 'info',
            memberName: 'supprt',
            description: 'Displays information on the official support server.'
        });
    }
    
    async run(msg, fromPattern, result) {
        let res = `Please [join](https://discord.gg/5kNM5Sh) the official Ticketer support server for more detailed support.`;
        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: res,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });
        
    }
};