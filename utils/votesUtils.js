const { CommandoClient } = require('discord.js-commando');

module.exports = {
    getVotes: async(client, userid) => {
        let db;
        if(client instanceof CommandoClient) db = client.provider.pg;
        else db = client;
        let res = await db.oneOrNone('SELECT count FROM votes WHERE userid = $1;', [userid]);
        if(res === null) {
            return false;
        }
        return res.count;
    },
    
};