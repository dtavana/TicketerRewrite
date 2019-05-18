const PremiumCommand  = require('../premium-command');
const messageUtils = require('../../utils/messageUtils');

module.exports = class SetSendToUserCommand extends PremiumCommand {
    constructor(client) {
        super(client, {
            name: 'setsendtouser',
            aliases: [],
            group: 'settings',
            memberName: 'setsendtouser',
            description: 'Sets whether the transcripts should be DM\'d to user. **NOTE:** this setting only takes affect when `settranscripts` is set to **true**',
            guildOnly: true,
            userPermissions: ['MANAGE_GUILD'],
            args: [
                {
                    key: 'sendToUser',
                    prompt: 'Please enter **true** to turn this feature on and **false** to turn this feature off.',
                    type: 'boolean'
                }
            ]
        });
    }
    
    async run(msg, {sendToUser}, fromPattern, result) {
        let res = await this.client.provider.set(msg.guild.id, 'sendToUser', sendToUser);
        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: `Old Send To User: \`${res}\`\n\nNew Send To User: \`${sendToUser}\``,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });

    }
};