const { CommandoClient } = require('discord.js-commando');
const Discord = require('discord.js');
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();


const bot = new CommandoClient({
    commandPrefix: process.env.DEFAULT_PREFIX,
    owner: process.env.OWNERS,
    invite: process.env.INVITE
})

bot.registry
    .registerDefaultTypes()
    .registerDefaultGroups()
    .registerDefaultCommands()
    .registerCommandsIn(path.join(__dirname, 'commands'))

bot.once('ready', () => {
    console.log(`Logged in as ${bot.user.tag}! (${bot.user.id})`)
    bot.user.setActivity('Ticketer', {type: "PLAYING"})
    })

bot.on('error', console.error)

bot.login(process.env.BOT_TOKEN)