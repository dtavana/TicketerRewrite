module.exports = {
    openTicket: async(client, guild, context) => {
        let contextid = context.id;
        let channels = await client.provider.get(guild, "ticketchannels", null);
        if(!channels) {
            return `The guild administrators has not setup a ticket channel yet! If you are a guild administrator, please use the \`${guild.commandPrefix}\`command in order to setup the guild.`;
        }

        channels = JSON.parse(channels);

        let found = false;
        let targetchannel;

        for(ticketchannel of channels) {
            if(ticketchannel.channelid === contextid || ticketchannel.contextid === false) {
                targetchannel = ticketchannel;
                found = true;
                break;
            }
        }

        if(!found) {
            return `${context.toString()} was not detected as a Ticket Channel. To view the current ticket channel for this guild, please use the ${guild.commandPrefix}channels command.`;
        }

        let currentTicket = await client.provider.get(guild, "currentTicket", null);
        if(!currentTicket) {
            currentTicket = 0;
        }
        else {
            currentTicket = parseInt(currentTicket)
        }
        await client.provider.set(guild, "currentTicket", currentTicket + 1)
        let ticketPrefix = await client.provider.get(guild, "ticketprefix", null);
        if(!ticketPrefix) {
            ticketPrefix = "ticket";
        }

        let adminRole = await client.provider.get(guild, "adminRole", null);
        let moderatorRole = await client.provider.get(guild, "moderatorRole", null);
        if(!adminRole || !moderatorRole) {
            `The guild administrators has not setup the Ticketer Admin roles. If you are an administrator, please run the ${guild.commandPrefix}setuproles command.`;
        }
        adminRole = await guild.roles.get(adminRole);
        moderatorRole = await guild.roles.get(moderatorRole);
        let category = await guild.channels.get(ticketchannel.categoryid)

        let channel = guild.channels.create(
            `${ticketPrefix}-${currentTicket}`,
            {
                type: "text",
                parent: category,
                permissionOverwrites: []

            }
        )
        return channel;
    },
    
};