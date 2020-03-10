const TicketerCommand  = require('../ticketer-command');
const messageUtils = require('../../utils/messageUtils');

module.exports = class GetStartedCommand extends TicketerCommand {
    constructor(client) {
        super(client, {
            name: 'getstarted',
            aliases: [],
            group: 'info',
            memberName: 'getstarted',
            description: 'Displays information about how to get Ticketer up and running.'
        });
    }
    
    async run(msg, fromPattern, result) {

        let res = `Thank you for using Ticketer. In order to get started, please start by setting up the Ticketer Roles. This can be done using \`${msg.guild.commandPrefix}setuproles\`. After that, you can use the \`${msg.guild.commandPrefix}setupchannel\` command to setup a Ticketer Channel. For a list of all the other commands, use \`${msg.guild.commandPrefix}help\`. If you have any questions at all, please join our support server with the \`${msg.guild.commandPrefix}support\` command.`;
        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: res,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });
    }
};
