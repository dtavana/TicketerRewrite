module.exports = {
    initializeServer: async(client, guild, ticketchannel, premium) => {
        let createdRole;
        let createdCategory;
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
            return `Non premium guilds may only set **1 ticket channel**. To have up to **5 ticket channels**, consider upgrading to premium using the ${guild.commandPrefix}upgrade command.`;
        }
        
        if(oldData.length >= 5) {
            return "Premium guilds may only have up to **5 ticket channels**.";
        }
        
        createdRole = await guild.roles.create({
            data: {
                name: `${ticketchannel.name} Admin`,
                color: "RED",
                permissions: 0
            },
            reason: "Ticketer Setup"
        });
        createdCategory = await guild.channels.create(
            `${ticketchannel.name} Category`,
            {
                type: "category"
            }
        );

        let ticketchannelid = ticketchannel.id

        newData = {};
        newData[ticketchannelid] = {
            role: createdRole.id,
            category: createdCategory.id
        }
        
        oldData.push(newData);

        newData = JSON.stringify(oldData);

        console.log(newData);
        await client.provider.set(guild.id, "ticketchannels", newData);

        return {
            channel: ticketchannel,
            role: createdRole,
            category: createdCategory
        }
    }
};