const PremiumCommand  = require('../premium-command');
const messageUtils = require('../../utils/messageUtils');

module.exports = class TranscriptChannelCommand extends PremiumCommand {
    constructor(client) {
        super(client, {
            name: 'transcriptchannel',
            aliases: ['settranscriptchannel'],
            group: 'settings',
            memberName: 'transcriptchannel',
            description: 'Sets the transcript channel for a guild',
            guildOnly: true,
            userPermissions: ['MANAGE_GUILD'],
            args: [
                {
                    key: 'transcriptChannel',
                    prompt: 'Please tag the desired transcript channel or enter **false** to turn this feature off',
                    type: 'channel|boolean'
                }
            ]
        });
    }
    
    async run(msg, {transcriptChannel}, fromPattern, result) {
        if(transcriptChannel === true) {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: 'Invalid entry for transcriptChannel.',
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }
        
        let res;

        if(!transcriptChannel) {
            res = await this.client.provider.set(msg.guild.id, 'transcriptChannel', false);
            transcriptChannel = '**TURNED OFF**';
        }
        else {
            res = await this.client.provider.set(msg.guild.id, 'transcriptChannel', transcriptChannel.id);
            await transcriptChannel.overwritePermissions([
		{
		    id: this.client.user.id,
		    allow: ['SEND_MESSAGES', 'VIEW_CHANNEL', 'USE_EXTERNAL_EMOJIS'],
		}
	    ]);
            transcriptChannel = transcriptChannel.toString();
            
        }

        res = await msg.guild.channels.resolve(res);
        if(!res) {
            res = '`Not found`';
        }
        else {
            res = res.toString();
        }
        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: `Old Transcript Channel: ${res}\n\nNew Transcript Channel: ${transcriptChannel}`,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });
    }
};
