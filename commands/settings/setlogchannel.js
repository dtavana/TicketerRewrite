const TicketerCommand  = require('../premium-command');
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
                    prompt: 'Please enter the desired log channel',
                    type: 'channel'
                }
            ]
        });
    }
    
    async run(msg, {logChannel}, fromPattern, result) {
        await logChannel.overwritePermissions(this.client.user, {
            'SEND_MESSAGES': true,
            'VIEW_CHANNEL': true,
            'USE_EXTERNAL_EMOJIS': true

        },
        'Ticketer Setup'
        );
        
        let res = await this.client.provider.set(msg.guild.id, 'logChannel', logChannel.id);
        res = await msg.guild.channels.get(res);
        if(!res) {
            res = '`Not found`';
        }
        else {
            res = res.toString();
        }
        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: `Old Log Channel: ${res}\n\nNew Log Channel: ${logChannel.toString()}`,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });

    }
};