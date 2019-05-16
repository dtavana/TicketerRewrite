const TicketerCommand  = require('../ticketer-command');
const messageUtils = require('../../utils/messageUtils');
const votesUtils = require('../../utils/votesUtils');

module.exports = class VotesCommand extends TicketerCommand {
    constructor(client) {
        super(client, {
            name: 'votes',
            aliases: ['upvotes'],
            group: 'info',
            memberName: 'votes',
            description: 'Displays how many votes you currently have for Ticketer'
        });
    }
    
    async run(msg, fromPattern, result) {
        let votes = await votesUtils.getVotes(this.client, msg.author.id);
        if(!votes) {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: `${msg.author.toString()} currently has no votes for me on DBL. To vote, please use the \`${msg.guild.commandPrefix}vote\` command.`,
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }
        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: `${msg.author.toString()} current has **${votes} votes** for me on DBL.`,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });
    }
};