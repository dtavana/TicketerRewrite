module.exports = {
    initEvents: async(client) => {
        client.on('guildCreate', async(guild) => {
            await client.provider.set(guild.id, 'currentTicket', 0);
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