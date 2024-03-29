module.exports = {
    openTicket: async (client, guild, context, user, subject) => {
        let contextid = context.id;
        let channels = await client.provider.get(guild, 'ticketchannels', null);
        let category;

        if (!channels) {
            return `The guild administrators have not setup a ticket channel yet! If you are a guild administrator, please use the \`${guild.commandPrefix}\`setupchannel in order to setup the guild.`;
        }

        let maxTickets = await client.provider.get(guild, 'maxTickets', null);
        if (!maxTickets) {
            maxTickets = -1;
        }
        else {
            maxTickets = parseInt(maxTickets);
        }
        let currentUserOpenTickets = await client.provider.get(`${guild.id}-channels`, user.id, null);

        if (!currentUserOpenTickets) {
            currentUserOpenTickets = 0;
        }
        else {
            currentUserOpenTickets = parseInt(currentUserOpenTickets);
        }

        if (maxTickets !== -1 && currentUserOpenTickets === maxTickets) {
            return `${user.toString()} already has **${maxTickets}** tickets opened.`;
        }

        channels = JSON.parse(channels);

        if (channels.length === 0) {
            return `The guild administrators have not setup a ticket channel yet! If you are a guild administrator, please use the \`${guild.commandPrefix}setupchannel\` in order to setup the guild.`;
        }

        let found = false;
        let targetchannel;

        for (let ticketchannel of channels) {
            if (ticketchannel.channelid === contextid || ticketchannel.channelid === false) {
                targetchannel = ticketchannel;
                found = true;
                break;
            }
        }

        if (!found) {
            return `${context.toString()} was not detected as a Ticket Channel. To view the current ticket channel for this guild, please use the \`${guild.commandPrefix}channels\` command.`;
        }


        let currentTicket = await client.provider.get(guild, 'currentTicket', null);
        if (!currentTicket) {
            currentTicket = 0;
        }
        else {
            currentTicket = parseInt(currentTicket);
        }
        await client.provider.set(guild, 'currentTicket', currentTicket + 1);
        let ticketPrefix = await client.provider.get(guild, 'ticketprefix', null);
        if (!ticketPrefix) {
            ticketPrefix = 'ticket';
        }

        let adminRole = await client.provider.get(guild, 'adminRole', null);
        let moderatorRole = await client.provider.get(guild, 'moderatorRole', null);
        if (!adminRole || !moderatorRole) {
            return `The guild administrators have not setup the Ticketer Admin roles. If you are an administrator, please run the \`${guild.commandPrefix}setuproles\` command.`;
        }
        adminRole = await guild.roles.fetch(adminRole);
        moderatorRole = await guild.roles.fetch(moderatorRole);
        if (!adminRole || !moderatorRole) {
            return `The Ticketer Admin roles can not be found. If you are an administrator, please run the \`${guild.commandPrefix}setuproles\` command to reset the roles.`;
        }
        let categoryid = targetchannel.categoryid;
        category = await guild.channels.resolve(categoryid);
        if (!category) {
            return `The Ticketer Category for ${context.toString()} could not be found. If you are an administrator, please run the ${guild.commandPrefix}setupchannel command to reset the ticket channel.`;
        }

        let createdChannel = await guild.channels.create(
            `${ticketPrefix}-${currentTicket}`,
            {
                type: 'text',
                parent: category,
                permissionOverwrites: [
                    { id: guild.roles.everyone, deny: ['SEND_MESSAGES', 'VIEW_CHANNEL'], type: 'role' },
                    { id: adminRole, allow: ['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY'], type: 'role' },
                    { id: moderatorRole, allow: ['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY'], type: 'role' },
                    { id: user, allow: ['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY'], type: 'member' },
                    { id: client.user, allow: ['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY'], type: 'member' }
                ]
            }
        );

        let openTickets = await client.provider.get(guild, 'openTickets', null);
        let allOpenTickets = await client.provider.redis.get('allOpenTickets');
        if (!allOpenTickets) {
            allOpenTickets = 0;
        }
        else {
            allOpenTickets = parseInt(allOpenTickets);
        }

        if (!openTickets) {
            openTickets = 0;
        }
        else {
            openTickets = parseInt(openTickets);
        }
        allOpenTickets += 1;
        openTickets += 1;
        currentUserOpenTickets += 1;

        let res = {
            'author': user.id,
            'subject': subject
        };
        res = JSON.stringify(res);

        await client.provider.set(`${guild.id}-channels`, createdChannel.id, res);
        await client.provider.set(guild, 'openTickets', openTickets);
        await client.provider.set(`${guild.id}-channels`, user.id, currentUserOpenTickets);
        await client.provider.redis.set('allOpenTickets', allOpenTickets);

        return createdChannel;
    },

    openJoinTicket: async (client, guild, user) => {
        let currentTicket = await client.provider.get(guild, 'currentTicket', null);
        if (!currentTicket) {
            currentTicket = 0;
        }
        else {
            currentTicket = parseInt(currentTicket);
        }
        await client.provider.set(guild, 'currentTicket', currentTicket + 1);
        let adminRole = await client.provider.get(guild, 'adminRole', null);
        let moderatorRole = await client.provider.get(guild, 'moderatorRole', null);
        adminRole = await guild.roles.fetch(adminRole);
        moderatorRole = await guild.roles.fetch(moderatorRole);
        if (!adminRole || !moderatorRole) {
            return `I could not open a welcome ticket for \`${user.tag}\` because you have not setup the Ticketer Roles. Please run \`${guild.commandPrefix}setuproles\` command.`;
        }
        let category = await client.provider.get(guild.id, 'ticketOnJoinCategory', null);
        category = await guild.channels.resolve(category);
        let createdChannel = await guild.channels.create(
            `${user.username}-jointicket`,
            {
                type: 'text',
                parent: category,
                permissionOverwrites: [
                    { id: guild.roles.everyone, deny: ['SEND_MESSAGES', 'VIEW_CHANNEL'], type: 'role' },
                    { id: adminRole, allow: ['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY'], type: 'role' },
                    { id: moderatorRole, allow: ['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY'], type: 'role' },
                    { id: user, allow: ['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY'], type: 'member' },
                    { id: client.user, allow: ['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS', 'ATTACH_FILES', 'READ_MESSAGE_HISTORY'], type: 'member' }
                ]
            }
        );
        let res = {
            'author': user.id,
            'subject': 'New Member Ticket'
        };
        res = JSON.stringify(res);
        await client.provider.set(`${guild.id}-channels`, createdChannel.id, res);
        return createdChannel;
    },

    closeTicket: async (client, guild, channel, member) => {
        let adminRole = await client.provider.get(guild, 'adminRole', null);
        let moderatorRole = await client.provider.get(guild, 'moderatorRole', null);

        let adminClose = await client.provider.get(guild, 'adminClose', null);

        if (member && !member.roles.cache.has(adminRole) && adminClose) {
            let aRole = await guild.roles.fetch(adminRole);
            if (!aRole) {
                aRole = '**NOT FOUND**';
            }
            else {
                aRole = aRole.toString();
            }
            return `The guild administrators have required the ${aRole} role to close tickets. If you believe this is in error, make sure you have the admin role.`;
        }


        let ticketData = await client.provider.get(`${guild.id}-channels`, channel.id, null);
        if (!ticketData) {
            return `${channel.toString()} was not detected as a open ticket!`;
        }
        ticketData = JSON.parse(ticketData);
        let author = ticketData.author;
        let subject = ticketData.subject;

        let createdAt = channel.createdAt;
        let channelHistory = await channel.messages.fetch();

        let openTickets = await client.provider.get(guild, 'openTickets', null);
        let closedTickets = await client.provider.get(guild, 'closedTickets', null);
        let allOpenTickets = await client.provider.redis.get('allOpenTickets');
        let handledTickets = await client.provider.redis.get('handledTickets');

        if (!allOpenTickets) {
            allOpenTickets = 0;
        }
        else {
            allOpenTickets = parseInt(allOpenTickets);
        }
        if (!openTickets) {
            openTickets = 0;
        }
        else {
            openTickets = parseInt(openTickets);
        }
        if (!closedTickets) {
            closedTickets = 0;
        }
        else {
            closedTickets = parseInt(closedTickets);
        }
        if (!handledTickets) {
            handledTickets = 0;
        }
        else {
            handledTickets = parseInt(handledTickets);
        }

        if (member.roles.cache.has(adminRole) || member.roles.cache.has(moderatorRole)) {
            let ticketTracking = await client.provider.get(guild, 'ticketTracking', null);
            if (!ticketTracking) {
                ticketTracking = {};
                ticketTracking[member.id] = 1;
            }
            else {
                ticketTracking = JSON.parse(ticketTracking);
                if (!ticketTracking[member.id]) {
                    ticketTracking[member.id] = 1;
                }
                else {
                    ticketTracking[member.id] += 1;
                }
            }
            ticketTracking = JSON.stringify(ticketTracking);
            await client.provider.set(guild, 'ticketTracking', ticketTracking);
        }
        allOpenTickets -= 1;
        openTickets -= 1;
        closedTickets += 1;
        handledTickets += 1;

        let currentUserOpenTickets = await client.provider.get(`${guild.id}-channels`, author, null);

        author = await client.users.fetch(author);
        let authorObject = author;
        if (!author) {
            author = 'Not found';
            authorObject = null;
            await client.provider.remove(`${guild.id}-channels`, author);
        }
        else {
            author = author.tag;
            if (!currentUserOpenTickets) {
                currentUserOpenTickets = 1;
            }
            else {
                currentUserOpenTickets = parseInt(currentUserOpenTickets);
            }
            currentUserOpenTickets -= 1;
            if (currentUserOpenTickets <= 0) {
                await client.provider.remove(`${guild.id}-channels`, authorObject.id);
            } else {
                await client.provider.set(`${guild.id}-channels`, authorObject.id, currentUserOpenTickets);
            }
        }

        await channel.delete('Closing Ticketer Ticket');
        await client.provider.remove(`${guild.id}-channels`, channel.id);
        await client.provider.set(guild, 'openTickets', openTickets);
        await client.provider.set(guild, 'closedTickets', closedTickets);
        await client.provider.set(guild, 'closedTickets', closedTickets);
        await client.provider.redis.set('allOpenTickets', allOpenTickets);
        await client.provider.redis.set('handledTickets', handledTickets);

        return {
            'createdAt': createdAt,
            'originalAuthor': author,
            'channelHistory': channelHistory,
            'authorObject': authorObject,
            'subject': subject
        };
    },

    closeInactiveTicket: async (client, guild, channel) => {
        let ticketData = await client.provider.get(`${guild.id}-channels`, channel.id, null);
        if (!ticketData) {
            return false;
        }
        ticketData = JSON.parse(ticketData);
        let author = ticketData.author;
        let createdAt = channel.createdAt;
        let subject = ticketData.subject;
        let channelHistory = await channel.messages.fetch();

        let openTickets = await client.provider.get(guild, 'openTickets', null);
        let closedTickets = await client.provider.get(guild, 'closedTickets', null);
        let allOpenTickets = await client.provider.redis.get('allOpenTickets');
        let handledTickets = await client.provider.redis.get('handledTickets');

        if (!allOpenTickets) {
            allOpenTickets = 0;
        }
        else {
            allOpenTickets = parseInt(allOpenTickets);
        }
        if (!openTickets) {
            openTickets = 0;
        }
        else {
            openTickets = parseInt(openTickets);
        }
        if (!closedTickets) {
            closedTickets = 0;
        }
        else {
            closedTickets = parseInt(closedTickets);
        }
        if (!handledTickets) {
            handledTickets = 0;
        }
        else {
            handledTickets = parseInt(handledTickets);
        }
        allOpenTickets -= 1;
        openTickets -= 1;
        closedTickets += 1;
        handledTickets += 1;

        let currentUserOpenTickets = await client.provider.get(`${guild.id}-channels`, author, null);

        author = await client.users.fetch(author);
        let authorObject = author;
        if (!author) {
            author = 'Not found';
            authorObject = null;
            await client.provider.remove(`${guild.id}-channels`, author);
        }
        else {
            author = author.tag;
            if (!currentUserOpenTickets) {
                currentUserOpenTickets = 1;
            }
            else {
                currentUserOpenTickets = parseInt(currentUserOpenTickets);
            }
            currentUserOpenTickets -= 1;
            if (currentUserOpenTickets <= 0) {
                await client.provider.remove(`${guild.id}-channels`, authorObject.id);
            } else {
                await client.provider.set(`${guild.id}-channels`, authorObject.id, currentUserOpenTickets);
            }
        }

        try {
            await channel.delete('Closing Ticketer Ticket');
        }
        catch { }

        await client.provider.remove(`${guild.id}-channels`, channel.id);
        await client.provider.set(guild, 'openTickets', openTickets);
        await client.provider.set(guild, 'closedTickets', closedTickets);
        await client.provider.redis.set('allOpenTickets', allOpenTickets);
        await client.provider.redis.set('handledTickets', handledTickets);


        return {
            createdAt,
            'originalAuthor': author,
            channelHistory,
            authorObject,
            subject
        };
    }

};
