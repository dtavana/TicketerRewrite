const PremiumCommand  = require('../premium-command');
const messageUtils = require('../../utils/messageUtils');

module.exports = class SetTranscriptsCommand extends PremiumCommand {
    constructor(client) {
        super(client, {
            name: 'settranscripts',
            aliases: [],
            group: 'settings',
            memberName: 'settranscripts',
            description: 'Sets whether transcripts should generated on ticket closing',
            guildOnly: true,
            userPermissions: ['MANAGE_GUILD'],
            args: [
                {
                    key: 'sendTranscripts',
                    prompt: 'Please enter **true** to turn this feature on and **false** to turn this feature off.',
                    type: 'boolean'
                }
            ]
        });
    }
    
    async run(msg, {sendTranscripts}, fromPattern, result) {
        let res = await this.client.provider.set(msg.guild.id, 'sendTranscripts', sendTranscripts);
        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: `Old Send Transcripts: \`${res}\`\n\nNew Send Transcripts: \`${sendTranscripts}\``,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });

    }
};