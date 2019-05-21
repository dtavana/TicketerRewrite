const { CommandoClient } = require('discord.js-commando');
require('dotenv').config();
const path = require('path');
const StrictUserArgumentType = require('./utils/strict-user-argument-type');
const pg = require('./controllers/postgres.controller');
const redis = require('./controllers/redis.controller');
const sub = require('./controllers/subscribe.controller');
const pub = require('./controllers/publish.controller');
const TicketerProvider = require('./utils/ticketer-provider');
const utils = require('./utils/utils');
const DBL = require('dblapi.js');

const client = new CommandoClient({
    commandPrefix: process.env.DEFAULT_PREFIX,
    owner: process.env.OWNERS.split(','),
    invite: process.env.INVITE
});

//const dbl = new DBL(process.env.DBL_TOKEN, client);

client.setProvider(new TicketerProvider(pg, redis, sub, pub));

client.registry
    .registerDefaultTypes()
    .registerType(StrictUserArgumentType)
    .registerGroups([
        ['tickets', 'Ticket commands'],
        ['moderation', 'Moderation commands'],
        ['settings', 'Settings commands'],
        ['credits', 'Credits commands'],
        ['info', 'Info commands'],
        ['database', 'Database commands']
    ])
    .registerDefaultGroups()
    .registerDefaultCommands()
    .registerCommandsIn(path.join(__dirname, 'commands'));

let prefixCommand = client.registry.resolveCommand('prefix');
client.registry.unregisterCommand(prefixCommand);

client.once('ready', async() => {
    console.log(`Logged in as ${client.user.tag}! (${client.user.id})`);
    client.user.setActivity(`-help | v2.0.0`, {type: 'WATCHING'});
    await utils.initEvents(client);
});

client.on('error', console.error);

client.login(process.env.BOT_TOKEN);