const TicketerCommand  = require('../ticketer-command');
const { User } = require('discord.js');
const messageUtils = require('../../utils/messageUtils');

module.exports = class ChannelsCommands extends TicketerCommand {
    constructor(client) {
        super(client, {
            name: 'channels',
            aliases: ['ticketchannels'],
            group: 'misc',
            memberName: 'channels',
            description: 'Displays all channels',
            guildOnly: true
        });
    }
    
    async run(msg, fromPattern, result) {
        let ticketChannels = await this.client.provider.get(msg.guild, "ticketchannels", null);
        ticketChannels = JSON.parse(ticketChannels);
        if(!ticketChannels || ticketChannels.length === 0) {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: `The guild adminstration has not setup a ticket channel. If you are an administrator, please run the \`${msg.guild.commandPrefix}setupchannel\` command to get started.`,
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }
        
        let resString = "";

        for(let channel of ticketChannels) {
            let ticketChannel = await msg.guild.channels.get(channel.channelid);
            let category = await msg.guild.channels.get(channel.categoryid);

            if(!ticketChannel) {
                ticketChannel = `\`${channel.channelid}\` **NOT FOUND**`;
            }
            else{
                ticketChannel = ticketChannel.toString();
            }
            if(!category) {
                category = `\`${channel.categoryid}\` **NOT FOUND**`;
            }
            else{
                category = `\`${category.name}\``;
            }

            resString += `**Channel:** ${ticketChannel} | **Category:** ${category}\n\n`;
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