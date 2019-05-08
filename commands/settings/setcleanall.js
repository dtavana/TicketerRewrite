const PremiumCommand  = require('../premium-command');
const messageUtils = require('../../utils/messageUtils');

module.exports = class SetCleanAllCommand extends PremiumCommand {
    constructor(client) {
        super(client, {
            name: 'setcleanall',
            aliases: [],
            group: 'settings',
            memberName: 'setcleanall',
            description: 'Sets whether the bot should delete all invocations of commands',
            guildOnly: true,
            userPermissions: ['MANAGE_GUILD'],
            args: [
                {
                    key: 'cleanAll',
                    prompt: 'Please enter **true** to turn this feature on and **false** to turn this feature off.',
                    type: 'boolean'
                }
            ]
        });
    }
    
    async run(msg, {cleanAll}, fromPattern, result) {
        let res = await this.client.provider.set(msg.guild.id, 'cleanAll', cleanAll);
        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: `Old Clean All: \`${res}\`\n\nNew Clean All: \`${cleanAll}\``,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });

    }
};