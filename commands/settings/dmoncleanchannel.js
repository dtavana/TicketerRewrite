const PremiumCommand  = require('../premium-command');
const messageUtils = require('../../utils/messageUtils');

module.exports = class DMOnCleanChannel extends PremiumCommand {
    constructor(client) {
        super(client, {
            name: 'dmoncleanchannel',
            aliases: ['setdmoncleanchannel'],
            group: 'settings',
            memberName: 'dmoncleanchannel',
            description: 'Sets whether the bot should DM a user when they try to type in a clean ticket channel',
            guildOnly: true,
            userPermissions: ['MANAGE_GUILD'],
            args: [
                {
                    key: 'dmOnCleanChannel',
                    prompt: 'Please enter **true** to turn this feature on and **false** to turn this feature off.',
                    type: 'boolean'
                }
            ]
        });
    }
    
    async run(msg, {dmOnCleanChannel}, fromPattern, result) {
        let res = await this.client.provider.set(msg.guild.id, 'dmOnCleanChannel', dmOnCleanChannel);
        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: `Old DM On Clean Channel: \`${res}\`\n\nNew DM On Clean Channel: \`${dmOnCleanChannel}\``,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });

    }
};