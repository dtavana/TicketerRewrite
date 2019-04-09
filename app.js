const { CommandoClient } = require('discord.js-commando');
const Discord = require('discord.js');
require('dotenv').config();
const path = require('path');
const fetch = require('node-fetch');

var utils = require("./utils/utils.js");

const redis = require("async-redis").createClient();
const { Pool } = require('pg');
const pg = new Pool({
    connectionString: process.env.CONNECTION_STRING,
  });
pg.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    pg.query("CREATE TABLE IF NOT EXISTS servers(serverid varchar PRIMARY KEY, currentticket smallint DEFAULT 1, setup boolean DEFAULT FALSE, userid varchar);");
    pg.query("CREATE TABLE IF NOT EXISTS premium(userid varchar, serverid varchar DEFAULT 0, key varchar, enabled boolean DEFAULT FALSE, paymentid varchar DEFAULT 0);");
    pg.query("CREATE TABLE IF NOT EXISTS tickets(userid varchar, ticketid varchar, serverid varchar);")
})

const bot = new CommandoClient({
    commandPrefix: process.env.DEFAULT_PREFIX,
    owner: process.env.OWNERS.split(","),
    invite: process.env.INVITE
})

bot.registry
    .registerDefaultTypes()
    .registerGroups([
        ['tickets', 'Ticket commands'],
        ['admin', 'Administration commands'],
        ['settings', 'Settings commands'],
        ['credits', 'Credits commands'],
        ['info', 'Info commands'],
        ['database', 'Database commands']
    ])
    .registerDefaultGroups()
    .registerDefaultCommands()
    .registerCommandsIn(path.join(__dirname, 'commands'))

bot.once('ready', async() => {
    console.log(`Logged in as ${bot.user.tag}! (${bot.user.id})`)
    bot.user.setActivity('Ticketer', {type: "PLAYING"})
    })

bot.on('error', console.error)

bot.login(process.env.BOT_TOKEN)