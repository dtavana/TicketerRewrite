module.exports = {
    getGuilds: (client, userId) => {
        return client.guilds.filter(guild => guild.ownerID == userId);
    }
}