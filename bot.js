require('dotenv').config();
require('./utils/configToProcess');
const { CommandoClient } = require('discord.js-commando');
const pg = require('./controllers/postgres.controller');
const redis = require('./controllers/redis.controller');
const TicketerProvider = require('./utils/ticketer-provider');
const path = require('path');
const StrictUserArgumentType = require('./utils/strict-user-argument-type');
const events = require('./utils/events');
const cleanup = require('./utils/cleanup');


const client = new CommandoClient({
    commandPrefix: process.env.DEFAULT_PREFIX,
    owner: process.env.OWNERS,
    invite: process.env.INVITE
});

client.setProvider(new TicketerProvider(pg, redis));

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
    .registerDefaultCommands({'prefix': false, 'unknownCommand': false})
    .registerCommandsIn(path.join(__dirname, 'commands'));

client.once('ready', async() => {
    console.log(`Logged in as ${client.user.tag}! (${client.user.id})`);
    client.user.setActivity(process.env.ACTIVITY_TEXT, {type: 'WATCHING'});
    await events.initEvents(client);
    setInterval(async() => {
        await cleanup.cleanExpiredCredits(client, pg);
    }, 60000);
    setInterval(async() => {
        await cleanup.cleanInactiveTickets(client, pg);
    }, 60000);
});

client.on('error', console.error);

client.login(process.env.BOT_TOKEN);