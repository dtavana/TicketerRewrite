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
        let res = `Please [join](http://discord.ticketerbot.xyz) the official Ticketer support server for more detailed support.`;
        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: res,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });
        
    }
};