const TicketerCommand  = require('../ticketer-command');
const messageUtils = require('../../utils/messageUtils');

module.exports = class VoteCommand extends TicketerCommand {
    constructor(client) {
        super(client, {
            name: 'vote',
            aliases: ['upvote'],
            group: 'info',
            memberName: 'vote',
            description: 'Sends information on how to vote for Ticketer on Discord Bot List.'
        });
    }
    
    async run(msg, fromPattern, result) {
        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: `[Click here to vote](https://discordbots.org/bot/542709669211275296/vote)`,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });
    }
};