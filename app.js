const { CommandoClient } = require('discord.js-commando');
const Discord = require('discord.js');
require('dotenv').config();
const path = require('path');
const pg = require('./controllers/postgres.controller');
const redis = require('./controllers/redis.controller');
const sub = require('./controllers/subscribe.controller');
const pub = require('./controllers/publish.controller');
const TicketerProvider = require('./utils/ticketer-provider');

const client = new CommandoClient({
    commandPrefix: process.env.DEFAULT_PREFIX,
    owner: process.env.OWNERS.split(","),
    invite: process.env.INVITE
});

client.setProvider(new TicketerProvider(pg, redis, sub, pub));

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

let prefixCommand = client.registry.resolveCommand("prefix");
client.registry.unregisterCommand(prefixCommand);

client.once('ready', async() => {
    console.log(`Logged in as ${client.user.tag}! (${client.user.id})`);
    client.user.setActivity(`${client.guilds.size} Guilds`, {type: "LISTENING"});
})
    

client.on('error', console.error)

client.login(process.env.BOT_TOKEN)