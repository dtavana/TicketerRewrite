const PremiumCommand  = require('../premium-command');
const messageUtils = require('../../utils/messageUtils');
const Discord = require('discord.js');

module.exports = class CleanChannelCommand extends PremiumCommand {
    constructor(client) {
        super(client, {
            name: 'cleanchannel',
            aliases: ['setcleanchannel'],
            group: 'settings',
            memberName: 'cleanchannel',
            description: 'Sets a ticket channel to only allow `new` invocations.',
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
                valString: 'There are no ticket channels to manipulate.',
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }
        ticketChannels = JSON.parse(ticketChannels);
        let found = false;
        let foundChannel;
        let newChannels = [];
        for(let curChannel of ticketChannels) {
            if(curChannel.channelid === channel.id) {
                found = true;
                curChannel.cleanChannel = true;
                newChannels.push(curChannel);
                break;
            }
            newChannels.push(curChannel);
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
        let newData = JSON.stringify(newChannels);
        await this.client.provider.set(msg.guild.id, 'ticketchannels', newData);
        const filter = m => !m.content.startsWith(`${msg.guild.commandPrefix}new`) && !m.content.startsWith(`${msg.guild.commandPrefix}ticket`) && !(m.embeds.length > 0 && ((m.embeds[0].description && m.embeds[0].description.includes("your ticket has been opened")) || (m.embeds[0].title && m.embeds[0].title.includes("Error"))));
        let collector = new Discord.MessageCollector(channel, filter, {})
        let dmOnCleanChannel = await this.client.provider.get(msg.guild.id, 'dmOnCleanChannel', null);
        collector.on('collect', async(message) => {
            try {
                if(dmOnCleanChannel) {
                    await messageUtils.sendError({
                        target: message.author, 
                        valString: `You may only create tickets in this channel.`,
                    });
                }
            }
            catch {};
            try { await message.delete(); }
            catch {};
        });
        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: `${channel.toString()} will now delete all messages that are new \`new\` invocations.`,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });
        
    }
};