const messageUtils = require('./messageUtils');

module.exports = { 
    initEvents: async(client) => {
        client.on('guildCreate', async(guild) => {
            await client.provider.set(guild.id, 'currentTicket', 0);
            let owner = guild.owner;
            let res = `Thank you for using Ticketer. In order to get started, please start by setting up the Ticketer Roles. This can be done using \`${guild.commandPrefix}setuproles\`. After that, you can use the \`${guild.commandPrefix}setupchannel\` command to setup a Ticketer Channel. For a list of all the other commands, use \`${guild.commandPrefix}help\`. If you have any questions at all, please join our support server with the \`${guild.commandPrefix}support\` command. To view this information again, please use the \`${guild.commandPrefix}getstarted\` command.`;
            await messageUtils.sendSuccess({
                target: owner, 
                valString: res
            });
        });

        client.on('guildDelete', async(guild) => {
            await client.provider.clear(guild.id);
            await client.provider.pg.none('DELETE FROM blacklist WHERE serverid = $1;', guild.id);
            await client.provider.pg.none('UPDATE premium SET serverid = 0, enabled = False WHERE serverid = $1;', guild.id);
            client.provider.guilds = client.provider.guilds.filter(id => id != guild.id);
        });
    },
};