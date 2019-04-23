module.exports = {
    initializeServer: async(client, guild) => {
        let createdRole;
        let createdCategory;

        createdRole = await guild.roles.create({
            data: {
                name: "Ticketer Admin",
                color: "RED",
                permissions: 0
            },
            reason: "Ticketer Setup"
        });
        createdCategory = await guild.channels.create(
            "Ticketer Category",
            {
                type: "category"
            }
        );
        
        let oldRole = await client.provider.set(guild.id, "adminRole", createdRole.id);
        let oldCategory = await client.provider.set(guild.id, "category", createdCategory.id);
        
        try {
            await guild.roles.get(oldRole).delete("Ticketer Setup");
        }
        catch {}

        try {
            await client.channels.get(oldCategory).delete("Ticketer Setup");
        }
        catch {}

        return {
            role: createdRole,
            category: createdCategory
        }
    }
};