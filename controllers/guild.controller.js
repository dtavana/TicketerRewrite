const guildUtils = require('../utils/guildUtils');
const pub = require('./publish.controller');
require('dotenv').config();

module.exports = {
    send: async(client, message) => {
        let data = JSON.parse(message);
        let guilds = guildUtils.getGuilds(client, data.userId);
        let key = data.key;

        await pub.publish(key, {'guilds': guilds});
    }
};