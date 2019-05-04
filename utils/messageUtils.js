const Discord = require('discord.js');
const utils = require('./utils');
require('dotenv').config();

module.exports = {
    sendSuccess: async(options) => {
        const successEmbed = new Discord.MessageEmbed()
            .setTitle('Success ✅')
            .setColor('#00FF00')
            .setTimestamp()
            .setFooter(process.env.FOOTER_TEXT)
            .setDescription(options.valString);
        
        let embedMessage = await options.target.send(successEmbed);

        let client = options.client || null;
        if(client === null){
            return embedMessage;
        }
        let messages = options.messages;
        messages.push(embedMessage);

        let guild = options.guild;

        let cleanAll = await client.provider.get(guild.id, 'cleanAll');
        client.setTimeout(utils.cleanMessages, 10000, cleanAll, messages);
        return embedMessage;
    },
    sendError: async(options) => {
        const errorEmbed = new Discord.MessageEmbed()
            .setTitle('Error ❌')
            .setColor('#FF0000')
            .setTimestamp()
            .setFooter(process.env.FOOTER_TEXT)
            .setDescription(options.valString);
        
        let embedMessage = await options.target.send(errorEmbed);

        let client = options.client || null;
        if(client === null){
            return;
        }
        let messages = options.messages;
        messages.push(embedMessage);

        let guild = options.guild;

        let cleanAll = await client.provider.get(guild.id, 'cleanAll');
        client.setTimeout(utils.cleanMessages, 10000, cleanAll, messages);
        return embedMessage;
    },
    sendCleanSuccess: async(options) => {
        const successEmbed = new Discord.MessageEmbed()
            .setColor('#00FF00')
            .setTimestamp()
            .setFooter(process.env.FOOTER_TEXT)
            .setDescription(options.valString);
        
        let embedMessage = await options.target.send(successEmbed);

        let client = options.client || null;
        if(client === null){
            return;
        }
        let messages = options.messages;
        messages.push(embedMessage);

        let guild = options.guild;

        return embedMessage;
    },
    sendWaiting: async(options) => {
        const waitingEmbed = new Discord.MessageEmbed()
        .setTitle("Are you sure you would like to perform the following")    
        .setColor('YELLOW')
        .setTimestamp()
        .setFooter(process.env.FOOTER_TEXT)
        .addField("**Action**", options.valString)
        
        let embedMessage = await options.target.send(waitingEmbed);
        await embedMessage.react("✅");
        await embedMessage.react("🚫")

        return embedMessage;
    },
    cleanWaiting: async(options) => {
        let client = options.client || null;
        if(client === null){
            return;
        }
        let messages = options.messages;
        let guild = options.guild;
        let cleanAll = await client.provider.get(guild.id, 'cleanAll');
        client.setTimeout(utils.cleanMessages, 10000, cleanAll, messages);
    },
    sendClosedTicket: async(client, channelName, originalAuthor, reason, timeString, guild, closer) => {
        let logChannel = await client.provider.get(guild, "logChannel", null);
        logChannel = await guild.channels.get(logChannel);
        if(!logChannel) {
            return;
        }
        
        const closeEmbed = new Discord.MessageEmbed()
            .setTitle('Log :notepad_spiral:')
            .setColor('#FF0000')
            .setTimestamp()
            .setFooter(process.env.FOOTER_TEXT)
            .setDescription(`**${closer.tag}** closed \`${channelName}\`\n\n**Reason:** \`${reason}\`\n\n**Original Author:** \`${originalAuthor}\`\n\n**Support Time:** \`${timeString}\``);
    
        let embedMessage = await logChannel.send(closeEmbed);
        return embedMessage;
    },

    sendOpenedTicket: async(client, target, welcomeMessage, subject, guild, user) => {
        const openEmbed = new Discord.MessageEmbed()
            .setColor('LUMINOUS_VIVID_PINK')
            .setTimestamp()
            .setFooter(process.env.FOOTER_TEXT)
            .setDescription(welcomeMessage)
            .addField("**Subject**", subject);
    
        let embedMessage = await target.send(openEmbed);

        let logChannel = await client.provider.get(guild, "logChannel", null);
        logChannel = await guild.channels.get(logChannel);
        if(!logChannel) {
            return;
        }
        
        const logEmbed = new Discord.MessageEmbed()
            .setTitle('Log :notepad_spiral:')
            .setColor('#00FF00')
            .setTimestamp()
            .setFooter(process.env.FOOTER_TEXT)
            .setDescription(`\`${user.tag}\` opened a new ticket: \`${target.name}\`\n\n**Subject:** \`${subject}\``);
    
        await logChannel.send(logEmbed);
        return embedMessage;
    },
};