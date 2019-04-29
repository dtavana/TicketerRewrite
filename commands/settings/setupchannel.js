const TicketerCommand  = require('../ticketer-command');
const messageUtils = require('../../utils/messageUtils');
const settingsUtils = require('../../utils/settingsUtils');

module.exports = class SetupRolesCommand extends TicketerCommand {
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
                    prompt: 'Please enter the desired ticket channel',
                    type: 'channel'
                }
            ]
        });
    }
    
    async run(msg, {channel}, fromPattern, result) {
        let premium = await this.checkPremium(this.client, msg);
        let channels = await settingsUtils.initializeChannels(this.client, msg.guild, channel, premium);

        if(typeof channels === "string") {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: channels,
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }

        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: `I have bound ${channels.channel.toString()} to the category ${channels.category.name}. All tickets created in ${channels.channel.toString()} will be placed under the ${channels.category.name} category.`,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });
    }
};