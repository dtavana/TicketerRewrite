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
const DBL = require('dblapi.js');
const express = require('express');
const bodyParser = require('body-parser');
const votesController = require('./controllers/votes.controller');
const donateController = require('./controllers/donate.controller');

const client = new CommandoClient({
    commandPrefix: process.env.DEFAULT_PREFIX,
    owner: process.env.OWNERS,
    invite: process.env.INVITE,
    shards: 'auto',
});

client.setProvider(new TicketerProvider(pg, redis)).then();

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
    .registerDefaultCommands({ 'prefix': false, 'unknownCommand': false })
    .registerCommandsIn(path.join(__dirname, 'commands'));

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}! (${client.user.id})`);
    await client.user.setActivity(process.env.ACTIVITY_TEXT, { type: 'WATCHING' });
    await events.initEvents(client);
    setInterval(async () => {
        await cleanup.cleanExpiredCredits(client, pg);
    }, 60000);
    setInterval(async () => {
        await cleanup.cleanInactiveTickets(client, pg);
    }, 60000);
    if (process.env.NODE_ENV === 'production') {
        const app = express();
        app.use(bodyParser.json());
        app.post('/donatewebhook', (req, res) => {
            if (req.get('authorization') === process.env.DB_AUTHENTICATION) {
                donateController.send(client, req.body, pg).then();
            }
            else {
                res.status(400).send();
            }
        });

        app.listen(parseInt(process.env.DB_HOOK_PORT), () => {
            console.log('Premium webhook server listening');
        });

        const dbl = new DBL(process.env.DBL_TOKEN, { webhookPort: parseInt(process.env.DBL_HOOK_PORT), webhookAuth: process.env.DBL_AUTHENTICATION });

        dbl.webhook.on('ready', () => {
            console.log('Vote webhook server listening');
        });
        dbl.webhook.on('vote', async (vote) => {
            await votesController.send(client, vote, pg);
        });
        await dbl.postStats(client.guilds.cache.size);
        setInterval(async () => {
            await dbl.postStats(client.guilds.cache.size);
        }, 900000);
    }
});


client.on('error', console.error);

client.login(process.env.BOT_TOKEN).then();
