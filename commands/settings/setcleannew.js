const PremiumCommand  = require('../premium-command');
const messageUtils = require('../../utils/messageUtils');

module.exports = class SetCleanNewCommand extends PremiumCommand {
    constructor(client) {
        super(client, {
            name: 'setcleannew',
            aliases: [],
            group: 'settings',
            memberName: 'setcleannew',
            description: 'Sets whether the bot should delete new ticket invocation messages',
            guildOnly: true,
            userPermissions: ['MANAGE_GUILD'],
            args: [
                {
                    key: 'cleanNew',
                    prompt: 'Please enter **true** to turn this feature on and **false** to turn this feature off.',
                    type: 'boolean'
                }
            ]
        });
    }
    
    async run(msg, {cleanNew}, fromPattern, result) {
        let res = await this.client.provider.set(msg.guild.id, 'cleanNew', cleanNew);
        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: `Old Clean New: \`${res}\`\n\nNew Clean New: \`${cleanNew}\``,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });

    }
};