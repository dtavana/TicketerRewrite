const Discord = require('discord.js');
const utils = require('./utils');
const redisUtils = require('./redisUtils')
require('dotenv').config();

module.exports = {
    sendSuccess: async(options) => {
        const successEmbed = new Discord.RichEmbed()
            .setTitle("Success ✅")
            .setColor("#00FF00")
            .setTimestamp()
            .setFooter(process.env.FOOTER_TEXT)
            .setDescription(options.valString)
        
        let embedMessage = await options.target.send(successEmbed);

        let client = options.client || null;
        if(client === null){
            return;
        }
        let messages = options.messages;
        messages.push(embedMessage);

        let guild = options.guild;

        let cleanAll = await redisUtils.fetch(client, guild.id, "cleanAll");
        client.setTimeout(utils.cleanMessages, 10000, cleanAll, cleanNew, messages)
    },
    sendCleanSuccess: async(options) => {
        const successEmbed = new Discord.RichEmbed()
            .setColor("#00FF00")
            .setTimestamp()
            .setFooter(process.env.FOOTER_TEXT)
            .setDescription(options.valString)
        
        let embedMessage = await options.target.send(successEmbed);

        let client = options.client || null;
        if(client === null){
            return;
        }
        let messages = options.messages;
        messages.push(embedMessage);

        let guild = options.guild;

        let cleanNew = await redisUtils.fetch(client, guild.id, "cleanNew");
        client.setTimeout(utils.cleanMessages, 10000, cleanNew, messages)
    }
}