const TicketerCommand  = require('../ticketer-command');
const messageUtils = require('../../utils/messageUtils');

module.exports = class RemoveChannelCommand extends TicketerCommand {
    constructor(client) {
        super(client, {
            name: 'removechannel',
            aliases: [],
            group: 'settings',
            memberName: 'removechannel',
            description: 'Removes a single ticket channel for this guild.',
            guildOnly: true,
            userPermissions: ['MANAGE_GUILD'],
            args: [
                {
                    key: 'channel',
                    prompt: 'Please tag the desired ticket channel.',
                    type: 'channel'
                }
            ]
        });
    }
    
    async run(msg, {channel}, fromPattern, result) {
        let ticketChannels = await this.client.provider.get(msg.guild.id, 'ticketchannels', null);
        if(!ticketChannels) {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: 'There are no ticket channels to be removed.',
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }
        ticketChannels = JSON.parse(ticketChannels);
        let found = false;
        for(let curChannel of ticketChannels) {
            if(curChannel.channelid === channel.id) {
                found = true;
                break;
            }
        }
        if(!found) {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: `${channel.toString()} was not detected as a ticket channel.`,
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }
        let collector = await messageUtils.sendWaiting({
            target: msg.channel, 
            valString: `Remove ticket channel ${channel.toString()}`,
            message: msg
        });
        collector.on('end', async(collected) => {
            if(collected.has('✅')) {
                let newData = ticketChannels.filter(theChannel => theChannel.channelid !== channel.id);
                newData = JSON.stringify(newData);
                await this.client.provider.set(msg.guild.id, "ticketchannels", newData);
                return await messageUtils.sendSuccess({
                    target: msg.channel, 
                    valString: `**${channel.toString()}** has been removed as a ticket channel.`,
                    client: this.client,
                    messages: [msg].concat(result.prompts, result.answers),
                    guild: msg.guild
                });
            }
            else {
                return await messageUtils.sendError({
                    target: msg.channel, 
                    valString: 'The current operation has been cancelled.',
                    client: this.client,
                    messages: [msg].concat(result.prompts, result.answers),
                    guild: msg.guild
                });
            }
        });
    }
};