module.exports = {
    getGuilds: async(client, userId) => {
        return client.guilds.filter(guild => guild.ownerID == userId);
    }
}