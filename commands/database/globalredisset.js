const TicketerCommand  = require('../ticketer-command');
const messageUtils = require('../../utils/messageUtils');

module.exports = class GlobalRedisSetCommand extends TicketerCommand {
    constructor(client) {
        super(client, {
            name: 'globalredisset',
            aliases: [],
            group: 'database',
            memberName: 'globalredisset',
            description: 'Sets a value based on key in the global context',
            ownerOnly: true,
            args: [
                {
                    key: 'key',
                    prompt: 'Please enter the key for the global value',
                    type: 'string'
                },
                {
                    key: 'value',
                    prompt: 'Please enter the value for the global key',
                    type: 'string'
                }
            ]
        });
    }
    
    async run(msg, {key, value}) {
        try {
            await this.client.provider.redis.set(key, value);
            await messageUtils.sendSuccess({
                target: msg.channel, 
                valString: `**Key:** \`${key}\` | **Value:** \`${value}\``
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