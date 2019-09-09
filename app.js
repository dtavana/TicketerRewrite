require('dotenv').config();
const { ShardingManager } = require('discord.js');
const DBL = require('dblapi.js');
const express = require('express');
const bodyParser = require('body-parser');
const votesController = require('./controllers/votes.controller');
const donateController = require('./controllers/donate.controller');

const manager = new ShardingManager('./bot.js', { 
    token: process.env.BOT_TOKEN
});


manager.on('shardCreate', async(shard) => {
    console.log(`Launched shard ${shard.id}`);
});
manager.spawn().then();

const app = express();
app.use(bodyParser.json());
app.post('/donatewebhook', (req, res) => {
    if(req.get('authorization') === process.env.DB_AUTHENTICATION) {
        donateController.send(manager, req.body).then();
    } 
    else {
        res.status(400).send();
    }  
}
);

app.listen(parseInt(process.env.DB_HOOK_PORT), () => {
    console.log('Premium webhook server listening');
});

if(process.env.NODE_ENV === 'production') {
    const dbl = new DBL(process.env.DBL_TOKEN, {webhookPort: parseInt(process.env.DBL_HOOK_PORT), webhookAuth: process.env.DBL_AUTHENTICATION});

    dbl.webhook.on('ready', () => {
        console.log('Vote webhook server listening');
    });
    dbl.webhook.on('vote', async(vote) => {
        await votesController.send(manager, vote);
    });

    setInterval(async() => {
        let guildsArray = await manager.fetchClientValues('guilds.size');
        let totalGuilds = guildsArray.reduce((prev, guildCount) => prev + guildCount, 0); 
        await dbl.postStats(totalGuilds);
    }, 900000);
}




