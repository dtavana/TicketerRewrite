const TicketerCommand  = require('../ticketer-command');
const messageUtils = require('../../utils/messageUtils');

module.exports = class PGSetCommand extends TicketerCommand {
    constructor(client) {
        super(client, {
            name: 'pgset',
            aliases: [],
            group: 'database',
            memberName: 'pgset',
            description: 'Sets a value in the Postgres database',
            ownerOnly: true,
            args: [
                {
                    key: 'query',
                    prompt: 'Please enter the query to execute on the database',
                    type: 'string'
                }
            ]
        });
    }
    
    async run(msg, {query}) {
        try {
            await this.client.provider.pg.none(query);
            await messageUtils.sendSuccess({
                target: msg.channel, 
                valString: 'The query was executed succesfully.'
            });
        }

        catch(error) {
            await messageUtils.sendError({
                target: msg.channel, 
                valString: `The following error occured: \`${error.message}\``
            });
        }

    }
};