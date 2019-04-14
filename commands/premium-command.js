const { Command } = require('discord.js-commando');

module.exports = class PremiumCommand extends Command {
    
    constructor(client, info) {
        super(client, info);
    }
    
    async checkPremium(client, msg) {
        let res = await client.provider.pg.oneOrNone("SELECT key FROM premium WHERE serverid = $1;", [msg.guild.id]);
        console.log(res);
        if(!res) {
            return false;
        }
        return true;

    }
}
