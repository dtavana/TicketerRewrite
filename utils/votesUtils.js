module.exports = {
    getVotes: async(client, userid) => {
        let res = await client.provider.pg.oneOrNone('SELECT count FROM votes WHERE userid = $1;', [userid]);
        return res.count;
        
    },
    
};