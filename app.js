const { ShardingManager } = require('discord.js');
const DBL = require('dblapi.js');
const server = require('./utils/webhookServer');
const votesController = require('./controllers/votes.controller');

require('dotenv').config();
const manager = new ShardingManager('./bot.js', { 
    token: process.env.BOT_TOKEN
});

manager.spawn();
manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));

const dbl = new DBL(process.env.DBL_TOKEN, {webhookAuth: process.env.DBL_AUTHENTICATION, webhookServer: server});
dbl.webhook.on('ready', hook => {
    console.log(`Webhook running with path ${hook.path}`);
});
dbl.webhook.on('vote', async(vote) => {
    await votesController.send(manager, vote);
});

server.listen(8080, () => {
    console.log('Webhook server listening');
});




