const TicketerCommand  = require('../ticketer-command');
const messageUtils = require('../../utils/messageUtils');
const settingsUtils = require('../../utils/settingsUtils');

module.exports = class SetupChannelCommand extends TicketerCommand {
    constructor(client) {
        super(client, {
            name: 'setupchannel',
            aliases: [],
            group: 'settings',
            memberName: 'setupchannel',
            description: 'Creates and saves a Ticketer Ticket Channel',
            userPermissions: ['MANAGE_GUILD'],
            guildOnly: true,
            args: [
                {
                    key: 'channel',
                    prompt: 'Please tag the desired ticket channel **OR** enter **false** to not restrict creation of tickets to a channel. **NOTE:** If you set this to **false**, the will override all other categories.',
                    type: 'channel|boolean'
                }
            ]
        });
    }
    
    async run(msg, {channel}, fromPattern, result) {
        let premium = await this.checkPremium(this.client, msg);
        let channels = await settingsUtils.initializeChannels(this.client, msg.guild, channel, premium);

        if(typeof channels === 'string') {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: channels,
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }

        let resString;

        if(!channels.channel) {
            resString = `I have bound **NO CHANNEL** to the ${channels.category.name}. All tickets created will be placed under the \`${channels.category.name}\`.`;
        }
        else {
            resString = `I have bound ${channels.channel.toString()} to the \`${channels.category.name}\`. All tickets created in ${channels.channel.toString()} will be placed under the \`${channels.category.name}\`.`;
        }

        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: resString,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });
    }
};