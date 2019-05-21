const messageUtils = require('./messageUtils');

module.exports = {
    initEvents: async(client) => {
        client.on('guildCreate', async(guild) => {
            await client.provider.set(guild.id, 'currentTicket', 0);
            let owner = guild.owner;
            let res = `Thank you for using Ticketer. In order to get started, please start by setting up the Ticketer Roles. This can be done using \`${guild.commandPrefix}setuproles\`. After that, you can use the \`${guild.commandPrefix}setupchannel\` command to setup a Ticketer Channel. For a list of all the other commands, use \`${guild.commandPrefix}help\`. If you have any questions at all, please join our support server with the \`${guild.commandPrefix}support\` command. To view this information again, please use the \`${guild.commandPrefix}getstarted\` command.`
            await messageUtils.sendSuccess({
                target: owner, 
                valString: res,
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        });
    },
    cleanMessages: async(clean, messages) => {
        if(clean) {
            for(let message of messages) {
                try {
                    message.delete();
                }
                catch {}
                
            }
        }  
    },
    timeConversion(millisec) {
        var seconds = (millisec / 1000).toFixed(1);
        var minutes = (millisec / (1000 * 60)).toFixed(1);
        var hours = (millisec / (1000 * 60 * 60)).toFixed(1);
        var days = (millisec / (1000 * 60 * 60 * 24)).toFixed(1);

        if (seconds < 60) {
            return seconds + " Seconds";
        } else if (minutes < 60) {
            return minutes + " Minutes";
        } else if (hours < 24) {
            return hours + " Hours";
        } else {
            return days + " Days"
        }
    }
};