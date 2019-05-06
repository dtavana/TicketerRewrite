const TicketerCommand  = require('../ticketer-command');
const messageUtils = require('../../utils/messageUtils');

module.exports = class GlobalRedisFetchCommand extends TicketerCommand {
    constructor(client) {
        super(client, {
            name: 'globalredisfetch',
            aliases: [],
            group: 'database',
            memberName: 'globalredisfetch',
            description: 'Fetches a value based on key in the global context',
            ownerOnly: true,
            args: [
                {
                    key: 'key',
                    prompt: 'The key for the global value',
                    type: 'string'
                }
            ]
        });
    }
    
    async run(msg, {key}, fromPattern, result) {
        try {
            let data = await this.client.provider.redis.get(key);
            if(!data) {
                return await messageUtils.sendError({
                    target: msg.channel, 
                    valString: `The following error occured: \`Key not found\``
                });
            }
            await messageUtils.sendSuccess({
                target: msg.channel, 
                valString: `**Key:** \`${key}\` | **Value:** \`${data}\``
            })
        }
        catch(error) {
            await messageUtils.sendError({
                target: msg.channel, 
                valString: `The following error occured: \`${error.message}\``
            });
        }

    }
};