module.exports = {
    openTicket: async(client, guild, context, user) => {
        let contextid = context.id;
        let channels = await client.provider.get(guild, "ticketchannels", null);
        if(!channels) {
            return `The guild administrators has not setup a ticket channel yet! If you are a guild administrator, please use the \`${guild.commandPrefix}\`setupchannel in order to setup the guild.`;
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

        let createdChannel = await guild.channels.create(
            `${ticketPrefix}-${currentTicket}`,
            {
                type: "text",
                parent: category,
                permissionOverwrites: [
                    {id: guild.defaultRole, deny: ['SEND_MESSAGES', 'VIEW_CHANNEL'], type: "role"},
                    {id: adminRole, allow: ['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS', 'ATTACH_FILES'], type: "role"},
                    {id: moderatorRole, allow: ['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS', 'ATTACH_FILES'], type: "role"},
                    {id: user, allow: ['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS', 'ATTACH_FILES'], type: "member"}
                ]
            }
        )

        let openTickets = await client.provider.get(guild, "openTickets", null);
        let allOpenTickets = await client.provider.redis.get("openTickets");

        if(!allOpenTickets) {
            allOpenTickets = 0;
        }
        else {
            allOpenTickets = parseInt(allOpenTickets)
        }

        if(!openTickets) {
            openTickets = 0;
        }
        else {
            openTickets = parseInt(openTickets)
        }
        allOpenTickets += 1;
        openTickets += 1;

        await client.provider.set(guild, createdChannel.id, user.id);
        await client.provider.set(guild, "openTickets", openTickets);
        await client.provider.redis.set("allOpenTickets", allOpenTickets);

        return createdChannel;
    },

    closeTicket: async(client, guild, channel, member) => {
        let adminRole = await client.provider.get(guild, "adminRole", null);
        adminRole = await guild.roles.get(adminRole);

        let adminClose = await client.provider.get(guild, "adminClose", null);

        if(!member.roles.has(adminRole) && adminClose) {
            return `The guild administrators have required the ${adminRole.toString()} role to close tickets. If you believe this is in error, make sure you have the admin role.`;
        }


        let author = await client.provider.get(guild, channel.id, null);
        if(!author) {
            return `${channel.toString()} was not detected as a open ticket!`;
        }

        author = await client.users.get(author);
        if(!author) {
            author = "Not found";
        }
        else {
            author = author.tag;
        }

        let createdAt = channel.createdAt;

        await channel.delete("Closing Ticketer Ticket");

        return {
            "createdAt": createdAt,
            "originalAuthor": author
        };
    }
    
};