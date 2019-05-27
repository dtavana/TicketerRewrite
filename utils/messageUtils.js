const Discord = require('discord.js');
const utils = require('./utils');
const transcripts = require('./transcripts');
require('dotenv').config();

module.exports = {
    sendSuccess: async(options) => {
        const successEmbed = new Discord.MessageEmbed()
            .setTitle('Success ✅')
            .setColor('GREEN')
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
            .setColor('RED')
            .setTimestamp()
            .setFooter(process.env.FOOTER_TEXT)
            .setDescription(options.valString);
        
        let embedMessage = await options.target.send(errorEmbed);

        let client = options.client || null;
        if(client === null || !options.messages || !options.guild){
            return;
        }
        let messages = options.messages;
        messages.push(embedMessage);

        let guild = options.guild;

        let cleanAll = await client.provider.get(guild.id, 'cleanAll');
        client.setTimeout(utils.cleanMessages, 10000, cleanAll, messages);
        return embedMessage;
    },
    sendDebug: async(options) => {
        const successEmbed = new Discord.MessageEmbed()
            .setColor('AQUA')
            .setTimestamp()
            .setFooter(process.env.FOOTER_TEXT)
            .addField("Channel Permissions", options.channelString, true)
            .addBlankField(true)
            .addField("Guild Permissions", options.guildString, true)
        
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
    sendCleanSuccess: async(options) => {
        const successEmbed = new Discord.MessageEmbed()
            .setColor('GREEN')
            .setTimestamp()
            .setFooter(process.env.FOOTER_TEXT)
            .setDescription(options.valString);
        
        let embedMessage = await options.target.send(successEmbed);

        let client = options.client || null;
        if(client === null){
            return;
        }
    },

    sendNewTicket: async(options) => {
        const successEmbed = new Discord.MessageEmbed()
            .setColor('GREEN')
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

        let cleanNew = await client.provider.get(guild.id, 'cleanNew');
        client.setTimeout(utils.cleanMessages, 10000, cleanNew, messages);
        return embedMessage;
    },

    sendWaiting: async(options) => {
        const waitingEmbed = new Discord.MessageEmbed()
            .setTitle('Are you sure you would like to perform the following')    
            .setColor('YELLOW')
            .setTimestamp()
            .setFooter(process.env.FOOTER_TEXT)
            .addField('**Action**', options.valString);
        
        let embedMessage = await options.target.send(waitingEmbed);
        await embedMessage.react('✅');
        await embedMessage.react('🚫');
        const filter = (reaction, user) => user.id === options.message.author.id && (reaction.emoji.name === '✅' || reaction.emoji.name === '🚫');
        let collector = new Discord.ReactionCollector(embedMessage, filter, {max: 1});
        return collector;
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
    sendTicketManipulation: async(client, guild, user, target, ticket, color, text) => {
        let logChannel = await client.provider.get(guild, 'logChannel', null);
        logChannel = await guild.channels.get(logChannel);
        if(!logChannel) return;
        const logEmbed = new Discord.MessageEmbed()
            .setTitle('Log :notepad_spiral:')
            .setColor(color)
            .setTimestamp()
            .setFooter(process.env.FOOTER_TEXT)
            .setDescription(text);
        await logChannel.send(logEmbed);
    },
    sendClosedTicket: async(client, channelName, originalAuthor, authorObject, reason, timeString, guild, closer, channelHistory, subject) => {
        let logChannel = await client.provider.get(guild, 'logChannel', null);
        let embedMessage;
        logChannel = await guild.channels.get(logChannel);
        if(logChannel) {
            /*
            const closeEmbed = new Discord.MessageEmbed()
                .setTitle('Log :notepad_spiral:')
                .setColor('RED')
                .setTimestamp()
                .setFooter(process.env.FOOTER_TEXT)
                .setDescription(`**${closer.tag}** closed \`${channelName}\`\n**Reason:** \`${reason}\`\n**Original Subject:** \`${subject}\`\n**Original Author:** \`${originalAuthor}\`\n**Support Time:** \`${timeString}\``);
            */
           const closeEmbed = new Discord.MessageEmbed()
                .setTitle('Log :notepad_spiral:')
                .setColor('RED')
                .setTimestamp()
                .setFooter(process.env.FOOTER_TEXT)
                .setDescription(`**${closer.tag}** closed \`${channelName}\``)
                .addField("Reason", reason, true)
                .addField("Support Time", timeString, true)
                .addField("Original Subject", subject, true)
                .addField("Original Author", originalAuthor, true)
                
            embedMessage = await logChannel.send(closeEmbed);
        }
        
        
        let sendTranscripts = await client.provider.get(guild, 'sendTranscripts', null);
        if(sendTranscripts) {
            let targetChannel;
            let transcriptChannel = await client.provider.get(guild, 'transcriptChannel', null);
            if(!transcriptChannel) {
                targetChannel = logChannel;
            }
            else {
                targetChannel = guild.channels.get(transcriptChannel);
            }
            let filePath = await transcripts.createTranscript(guild, channelName, channelHistory);
            if(targetChannel) {
                if(targetChannel !== logChannel) {
                    const transcriptEmbed = new Discord.MessageEmbed()
                    .setTitle('Transcript :notepad_spiral:')
                    .setColor('RED')
                    .setTimestamp()
                    .setFooter(process.env.FOOTER_TEXT)
                    .setDescription(`**${closer.tag}** closed \`${channelName}\`\n**Reason:** \`${reason}\`\n**Original Author:** \`${originalAuthor}\`\n**Support Time:** \`${timeString}\`\n**The transcript is below**`);
                    await targetChannel.send(transcriptEmbed);
                }
                await targetChannel.send({
                    files: [filePath]
                }); 
            } 
            let sendToUser = await client.provider.get(guild, 'sendToUser', null);
            if(sendToUser && authorObject) {
                const userEmbed = new Discord.MessageEmbed()
                    .setTitle('Transcript :notepad_spiral:')
                    .setColor('RED')
                    .setTimestamp()
                    .setFooter(process.env.FOOTER_TEXT)
                    .setDescription(`**${closer.tag}** closed your ticket, \`${channelName}\`\n**Reason:** \`${reason}\`\n**Support Time:** \`${timeString}\`\n**The transcript is below**`);
                
                try {
                    await authorObject.send(userEmbed);
                    await authorObject.send({
                    files: [filePath]
                    });
                }
                catch {}
                
            }
            await transcripts.deleteTranscript(filePath);
        }

        return embedMessage;
    },

    sendOpenedTicket: async(client, target, welcomeMessage, subject, guild, user) => {
        welcomeMessage = welcomeMessage.replace(':user:', user.toString());
        welcomeMessage = welcomeMessage.replace(':server:', guild.name);
        await target.send(user.toString());
        const openEmbed = new Discord.MessageEmbed()
            .setColor('LUMINOUS_VIVID_PINK')
            .setTimestamp()
            .setFooter(process.env.FOOTER_TEXT)
            .setDescription(welcomeMessage)
            .addField('**Subject**', subject);
    
        let embedMessage = await target.send(openEmbed);

        let logChannel = await client.provider.get(guild, 'logChannel', null);
        logChannel = await guild.channels.get(logChannel);
        if(!logChannel) {
            return;
        }
        
        const logEmbed = new Discord.MessageEmbed()
            .setTitle('Log :notepad_spiral:')
            .setColor('GREEN')
            .setTimestamp()
            .setFooter(process.env.FOOTER_TEXT)
            .setDescription(`\`${user.tag}\` opened a new ticket: \`${target.name}\``)
            .addField("Subject", subject, true)
    
        await logChannel.send(logEmbed);
        return embedMessage;
    }
};