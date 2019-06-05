const messageUtils = require('./messageUtils');

module.exports = {
    cleanExpiredCredits: async(client, pg) => {
        let expiredCredits = await pg.any('SELECT * FROM premium WHERE expires < NOW();');
        for(let credit of expiredCredits) {
            let userId = credit.userid;
            let serverid = credit.serverid;
            if(serverid) {
                await client.provider.clear(serverid);
                await client.provider.clear(`${serverid}-channels`);
            }
            await pg.none('DELETE FROM premium WHERE key = $1;', credit.key);
            let user = client.users.get(userId);
            if(!user) return;
            else {
                await messageUtils.sendCleanSuccess({
                    target: user, 
                    valString: `Your vote credit with key \`${credit.key}\` has expired and premium has been removed from its server if it was enabled.`,
                    client: null
                });
            }
        }
    }
};