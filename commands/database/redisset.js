const TicketerCommand  = require('../ticketer-command');
const messageUtils = require('../../utils/messageUtils');

module.exports = class RedisSetCommand extends TicketerCommand {
    constructor(client) {
        super(client, {
            name: 'redisset',
            aliases: [],
            group: 'database',
            memberName: 'redisset',
            description: 'Sets a key/field pair in a hash set or an entire hash set',
            ownerOnly: true,
            args: [
                {
                    key: 'key',
                    prompt: 'The key for the hashset',
                    type: 'string'
                },
                {
                    key: 'field',
                    prompt: 'The field for the hashset',
                    type: 'string',
                    default: false
                },
                {
                    key: 'value',
                    prompt: 'The value for the new data in the hashset',
                    type: 'string',
                    default: false
                }
            ]
        });
    }
    
    async run(msg, {key, field, value}, fromPattern, result) {
        try {
            let data = await this.client.provider.set(key, field, value);
            await messageUtils.sendSuccess({
                target: msg.channel, 
                valString: `**Key:** \`${key}\` | **Field:** \`${field}\`\n\n**Old Value:** \`${data}\` | **New Value:** \`${value}\``
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