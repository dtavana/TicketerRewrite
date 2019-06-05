const TicketerCommand  = require('../ticketer-command');
const messageUtils = require('../../utils/messageUtils');

module.exports = class InviteCommand extends TicketerCommand {
    constructor(client) {
        super(client, {
            name: 'invite',
            aliases: ['inviteme'],
            group: 'info',
            memberName: 'invite',
            description: 'Displays an invite for the bot.'
        });
    }
    
    async run(msg, fromPattern, result) {
        let res = 'To invite me, [click here](https://discordapp.com/oauth2/authorize?client_id=542709669211275296&scope=bot&permissions=805432400)';
        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: res,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });
    }
};