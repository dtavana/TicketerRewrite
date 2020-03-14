const TicketerCommand  = require('../ticketer-command');
const messageUtils = require('../../utils/messageUtils');

module.exports = class LogChannelCommand extends TicketerCommand {
    constructor(client) {
        super(client, {
            name: 'logchannel',
            aliases: ['setlogchannel'],
            group: 'settings',
            memberName: 'logchannel',
            description: 'Sets the log channel for a guild',
            guildOnly: true,
            userPermissions: ['MANAGE_GUILD'],
            args: [
                {
                    key: 'logChannel',
                    prompt: 'Please tag the desired log channel or enter **false** to turn this feature off',
                    type: 'channel|boolean'
                }
            ]
        });
    }
    
    async run(msg, {logChannel}, fromPattern, result) {
        if(logChannel === true) {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: 'Invalid entry for logChannel.',
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }
        
        let res;

        if(!logChannel) {
            res = await this.client.provider.set(msg.guild.id, 'logChannel', false);
            logChannel = '**TURNED OFF**';
        }
        else {
            res = await this.client.provider.set(msg.guild.id, 'logChannel', logChannel.id);
	    await logChannel.overwritePermissions([
		{
		    id: this.client.user.id,
		    allow: ['SEND_MESSAGES', 'VIEW_CHANNEL', 'USE_EXTERNAL_EMOJIS'],
		}
	    ]);
            logChannel = logChannel.toString();
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
            valString: `Old Log Channel: ${res}\n\nNew Log Channel: ${logChannel}`,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });
    }
};
