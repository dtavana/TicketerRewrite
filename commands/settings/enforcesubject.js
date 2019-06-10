const PremiumCommand  = require('../premium-command');
const messageUtils = require('../../utils/messageUtils');

module.exports = class EnforceSubjectCommand extends PremiumCommand {
    constructor(client) {
        super(client, {
            name: 'enforcesubject',
            aliases: ['setenforcesubject'],
            group: 'settings',
            memberName: 'enforcesubject',
            description: 'Sets whether the a user must provide a subject when opening a ticket++++',
            guildOnly: true,
            userPermissions: ['MANAGE_GUILD'],
            args: [
                {
                    key: 'enforceSubject',
                    prompt: 'Please enter **true** to turn this feature on and **false** to turn this feature off.',
                    type: 'boolean'
                }
            ]
        });
    }
    
    async run(msg, {enforceSubject}, fromPattern, result) {
        let res = await this.client.provider.set(msg.guild.id, 'enforceSubject', enforceSubject);
        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: `Old Enforce Subject: \`${res}\`\n\nNew Enforce Subject: \`${enforceSubject}\``,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });

    }
};