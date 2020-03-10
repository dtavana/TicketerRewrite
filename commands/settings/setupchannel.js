const TicketerCommand  = require('../ticketer-command');
const messageUtils = require('../../utils/messageUtils');
const settingsUtils = require('../../utils/settingsUtils');
const Discord = require('discord.js');

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
                    prompt: 'Please tag the desired ticket channel **OR** enter **false** to not restrict creation of tickets to a channel. **NOTE:** If you set this to **false**, the will override all other ticket channels.',
                    type: 'channel|boolean'
                },
                {
                    key: 'cleanTicketChannel',
                    prompt: 'Please enter **true** to turn this feature on and **false** to turn this feature off. **NOTE:** This setting is only available to premium users.',
                    type: 'boolean',
                    default: false
                }
            ]
        });
    }
    
    async run(msg, {channel, cleanTicketChannel}, fromPattern, result) {
        if(channel === true) {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: `\`true\` is not a valid value for **channel**.`,
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }
        let premium = await this.checkPremium(this.client, msg);
        if(cleanTicketChannel && !premium) {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: `Setting the channel to clean messages that are new ticket invocations is a premium only feature. Consider upgrading with \`${msg.guild.commandPrefix}upgrade\`.`,
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }
        let channels = await settingsUtils.initializeChannels(this.client, msg.guild, channel, cleanTicketChannel, premium);

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
            resString = `I have bound **NO CHANNEL** to the ${channels.category.name}. All tickets created will be placed under the \`${channels.category.name}\`. Feel free to rename the category.`;
        }
        else {
            resString = `I have bound ${channels.channel.toString()} to the \`${channels.category.name}\`. All tickets created in ${channels.channel.toString()} will be placed under the \`${channels.category.name}\`. Feel free to rename the category.`;
        }

        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: resString,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });

        if(cleanTicketChannel && channels.channel) {
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
         }
    }
};
