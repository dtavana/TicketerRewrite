const Discord = require('discord.js');

module.exports = {
    initializeRoles: async(client, guild) => {
        let createdAdminRole;
        let createdModeratorRole;
        let createdCategory;

        let adminRole = await client.provider.get(guild.id, "adminRole", null);
        let moderatorRole = await client.provider.get(guild.id, "moderatorRole", null);

        try {
            adminRole = await guild.roles.fetch(adminRole);
            adminRole.delete("Rerunning Ticketer Role Setup;")
        }
        catch {}

        try {
            moderatorRole = await guild.roles.fetch(moderatorRole);
            moderatorRole.delete("Rerunning Ticketer Role Setup;")
        }
        catch {}
        
        createdAdminRole = await guild.roles.create({
            data: {
                name: `Ticketer Admin`,
                color: "RED",
                permissions: 0
            },
            reason: "Ticketer Setup"
        });
        createdModeratorRole = await guild.roles.create({
            data: {
                name: `Ticketer Moderator`,
                color: "GREEN",
                permissions: 0
            },
            reason: "Ticketer Setup"
        });

        await client.provider.set(guild.id, "adminRole", createdAdminRole.id);
        await client.provider.set(guild.id, "moderatorRole", createdModeratorRole.id);

        return {
            adminRole: createdAdminRole,
            moderatorRole: createdModeratorRole
        };
    },
    initializeChannels: async(client, guild, ticketchannel, cleanTicketChannel, premium) => {
        let createdCategory;
        let ticketchannelname;
        let ticketchannelid;
        let oldData;
        let newData;

        oldData = await client.provider.get(guild.id, "ticketchannels", null);

        if(oldData === undefined || oldData === null) {
            oldData = [];
        }
        else {
            oldData = JSON.parse(oldData);
        }

        if(oldData.length >= 1 && !premium) {
            return `Non premium guilds may only set **1 ticket channel**. To have up to **10 ticket channels**, consider upgrading to premium using the \`${guild.commandPrefix}upgrade\` command.`;
        }
        
        if(oldData.length >= 10) {
            return "Premium guilds may only have up to **10 ticket channels**.";
        }

        for(let curChannel of oldData) {
            if(curChannel.channelid === ticketchannel.id) {
                return `${ticketchannel.toString()} has already been setup as a ticket channel.`
            }
        }

        if(!ticketchannel) {
            ticketchannelname = "Ticketer";
            ticketchannelid = false;
        }
        else {
            ticketchannelname = ticketchannel.name;
            ticketchannelid = ticketchannel.id;
            try {
                await ticketchannel.overwritePermissions([
                    {
                        id: client.user.id,
                        allow: ['SEND_MESSAGES', 'VIEW_CHANNEL', 'USE_EXTERNAL_EMOJIS']
                    }
                ])
                await ticketchannel.setRateLimitPerUser(15);
            }
            catch(e) {
                console.log(e);
                return `I do not have permissions to setup ${ticketchannel.toString()}. I need the **Manage Channels** permission in order to proceed.`
            }
        
        } 
        
        oldData = await client.provider.get(guild.id, "ticketchannels", null);

        
        if(oldData === undefined || oldData === null) {
            oldData = [];
        }
        else {
            oldData = JSON.parse(oldData);
        }

        if(oldData.length >= 1 && !premium) {
            return `Non premium guilds may only set **1 ticket channel**. To have up to **10 ticket channels**, consider upgrading to premium using the \`${guild.commandPrefix}upgrade\` command.`;
        }
        
        if(oldData.length >= 10) {
            return "Premium guilds may only have up to **10 ticket channels**.";
        }
        
        createdCategory = await guild.channels.create(
            `${ticketchannelname} Category`,
            {
                type: "category"
            }
        );
        
        oldData.push({
            channelid: ticketchannelid,
            categoryid: createdCategory.id,
            cleanChannel: cleanTicketChannel
        })
        
        
        newData = JSON.stringify(oldData);

        await client.provider.set(guild.id, "ticketchannels", newData);

        return {
            channel: ticketchannel,
            category: createdCategory
        }
    }
};
