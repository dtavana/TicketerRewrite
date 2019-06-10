const messageUtils = require('./messageUtils');
const ticketUtils = require('./ticketUtils');

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

        client.on('guildMemberAdd', async(member) => {
            let res = await client.provider.get(member.guild.id, 'ticketOnJoin', null);
            if(res) {
                let channel = await ticketUtils.openJoinTicket(client, member.guild, member.user);
                if(typeof channel === 'string') {
                    return await messageUtils.sendError({
                        target: member.guild.owner, 
                        valString: channel,
                        client: null
                    });
                }
                let welcomeMessage = await client.provider.get(member.guild, 'joinWelcomeMessage', null);
                if(!welcomeMessage) {
                    welcomeMessage = 'Welcome to :server:. An admin will be with you shortly.';
                }
                await messageUtils.sendOpenedTicket(client, channel, welcomeMessage, 'New Member Ticket', member.guild, member.user);
            }
        });
    },
};