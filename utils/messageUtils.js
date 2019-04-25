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
    }
};