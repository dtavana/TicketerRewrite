const PremiumCommand  = require('../premium-command');
const messageUtils = require('../../utils/messageUtils');

module.exports = class SetAdminClose extends PremiumCommand {
    constructor(client) {
        super(client, {
            name: 'setadminclose',
            aliases: [],
            group: 'settings',
            memberName: 'setadminclose',
            description: 'Sets whether it is needed for the Ticketer Admin role is needed to close a ticket',
            guildOnly: true,
            userPermissions: ['MANAGE_GUILD'],
            args: [
                {
                    key: 'adminClose',
                    prompt: 'Please enter **true** to turn this feature on and **false** to turn this feature off.',
                    type: 'boolean'
                }
            ]
        });
    }
    
    async run(msg, {adminClose}, fromPattern, result) {
        let res = await this.client.provider.set(msg.guild.id, 'adminClose', adminClose);
        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: `Old Admin Close: \`${res}\`\n\nNew Admin Close: \`${adminClose}\``,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });

    }
};