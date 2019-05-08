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