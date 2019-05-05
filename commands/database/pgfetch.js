const TicketerCommand  = require('../ticketer-command');
const messageUtils = require('../../utils/messageUtils');

module.exports = class PGFetchCommand extends TicketerCommand {
    constructor(client) {
        super(client, {
            name: 'pgfetch',
            aliases: [],
            group: 'database',
            memberName: 'pgfetch',
            description: 'Fetches a value in the Postgres database',
            guildOnly: true,
            ownerOnly: true,
            args: [
                {
                    key: 'query',
                    prompt: 'The query to execute on the database',
                    type: 'string'
                }
            ]
        });
    }
    
    async run(msg, {query}, fromPattern, result) {
        try {
            let data = await this.client.provider.pg.any(query);
            if(data.length === 0) {
                return await messageUtils.sendError({
                    target: msg.channel, 
                    valString: "The following error occured: `No data was returned`"
                });
            }
            else {
                for(let entry of data) {
                    let resString = "";
                    for(let pair of Object.entries(entry)) {
                        resString += `**Key:** \`${pair[0]}\` | **Value:** \`${pair[1]}\`\n`;
                    }
                    await messageUtils.sendSuccess({
                        target: msg.channel, 
                        valString: resString
                    })
                }
            }
        }

        catch(error) {
            await messageUtils.sendError({
                target: msg.channel, 
                valString: `The following error occured: \`${error.message}\``
            });
        }

    }
};