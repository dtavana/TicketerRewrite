module.exports = {
    getBlacklisted: async(client, target, guild) => {
        let data = await client.provider.pg.oneOrNone('SELECT adminid FROM blacklist WHERE userid = $1 AND serverid = $2;', [target.id, guild.id]);
        return data;
    },
    blacklist: async(client, target, guild, admin) => {
        await client.provider.pg.none('INSERT INTO blacklist(userid, serverid, adminid) VALUES($1, $2, $3);', [target.id, guild.id, admin.id]);
    },
    unblacklist: async(client, target, guild) => {
        await client.provider.pg.none('DELETE FROM blacklist WHERE userid = $1 AND serverid = $2;', [target.id, guild.id]);
    }
};