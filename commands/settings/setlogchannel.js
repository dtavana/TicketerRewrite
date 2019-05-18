const TicketerCommand  = require('../ticketer-command');
const messageUtils = require('../../utils/messageUtils');

module.exports = class SetLogChannelCommand extends TicketerCommand {
    constructor(client) {
        super(client, {
            name: 'setlogchannel',
            aliases: [],
            group: 'settings',
            memberName: 'setlogchannel',
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
                valString: `Invalid entry for logChannel.`,
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }
        
        let res;

        if(!logChannel) {
            res = await this.client.provider.set(msg.guild.id, 'logChannel', false);
            logChannel = "**TURNED OFF**"
        }
        else {
            res = await this.client.provider.set(msg.guild.id, 'logChannel', logChannel.id);
            await logChannel.overwritePermissions(this.client.user, {
                'SEND_MESSAGES': true,
                'VIEW_CHANNEL': true,
                'USE_EXTERNAL_EMOJIS': true
    
            },
            'Ticketer Setup'
            );
            logChannel = logChannel.toString();
            
        }

        res = await msg.guild.channels.get(res);
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