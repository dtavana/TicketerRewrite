module.exports = {
    openTicket: async(client, guild, context) => {
        context = context.id;
        let channels = await client.provider.get(guild, "ticketchannels", null);
        if(!channels) {
            return `The guild administrators has not setup a ticket channel yet! If you are a guild administrator, please use the \`${guild.commandPrefix}\`command in order to setup the guild.`;
        }

        channels = JSON.parse(channels);

        if(!(context in channels)) {
            return `${context.channel.toString()} is not registered as a ticket channel. Use the \`${guild.commandPrefix}channels\` command to see all ticket channels.`
        }

        let currentTicket = await client.provider.get(guild, "currentTicket", null);
        if(!currentTicket) {
            currentTicket = 0;
        }
        await client.provider.set(guild, "currentTicket", currentTicket + 1)
        let ticketPrefix = await client.provider.get(guild, "ticketprefix", null);
        if(!ticketPrefix) {
            ticketPrefix = "ticket";
        }

        let adminRole = await guild.roles.fetch(channels.context.adminRole)
        let moderatorRole = await guild.roles.fetch(channels.context.moderatorRole)
        let category = await guild.channels.fetch(channels.context.category)

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