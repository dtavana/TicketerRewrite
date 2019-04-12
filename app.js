const { CommandoClient } = require('discord.js-commando');
const Discord = require('discord.js');
require('dotenv').config();
const path = require('path');
const pg = require('./controllers/postgres.controller');
const redis = require('./controllers/redis.controller');
const redisUtils = require('./utils/redisUtils');

const client = new CommandoClient({
    commandPrefix: process.env.DEFAULT_PREFIX,
    owner: process.env.OWNERS.split(","),
    invite: process.env.INVITE
});

client.registry
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

client.once('ready', async() => {
    console.log(`Logged in as ${client.user.tag}! (${client.user.id})`);
    client.user.setActivity(`${client.guilds.size} Guilds`, {type: "LISTENING"});
    client.redis = redis;
    client.db = pg;
    console.log("Database properties succesfully linked")
    console.log("Checking PG Tables");
    await pg.query("CREATE TABLE IF NOT EXISTS servers(serverid varchar PRIMARY KEY, currentticket smallint DEFAULT 1, setup boolean DEFAULT FALSE, userid varchar);");
    await pg.query("CREATE TABLE IF NOT EXISTS premium(userid varchar, serverid varchar, key varchar, enabled boolean DEFAULT FALSE, paymentid varchar DEFAULT 0);");
    await pg.query("CREATE TABLE IF NOT EXISTS blacklist(userid varchar, serverid varchar);");
    await pg.query("CREATE TABLE IF NOT EXISTS payments(userid varchar, paymentid varchar);");
    await pg.query("CREATE TABLE IF NOT EXISTS votes(userid varchar PRIMARY KEY, count smallint);");
    console.log("PG Tables Checked");
    console.log("Starting Redis Sub Pipeline")
    redisUtils.initSub(client, client.redis)
})
    

client.on('error', console.error)

client.login(process.env.BOT_TOKEN)