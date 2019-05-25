const { ShardingManager } = require('discord.js');
require('dotenv').config();
const manager = new ShardingManager('./bot.js', { 
    token: process.env.BOT_TOKEN
});

manager.spawn();
manager.on('launch', shard => console.log(`Launched shard ${shard.id}`));