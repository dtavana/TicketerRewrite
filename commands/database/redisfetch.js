const TicketerCommand  = require('../ticketer-command');
const messageUtils = require('../../utils/messageUtils');

module.exports = class RedisFetchCommand extends TicketerCommand {
    constructor(client) {
        super(client, {
            name: 'redisfetch',
            aliases: [],
            group: 'database',
            memberName: 'redisfetch',
            description: 'Fetches a key/field pair in a hash set or an entire hash set if field is omitted',
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
                }
            ]
        });
    }
    
    async run(msg, {key, field}, fromPattern, result) {
        try {
            let data;
            if(!field) {
                data = await this.client.provider.redis.hgetall(key);
                if(data && data.length !== 0) {
                    let resString = "";
                    for(let pair of Object.entries(data)) {
                        resString += `**Key:** \`${key}\` | **Field:** \`${pair[0]}\` | **Result:** \`${pair[1]}\`\n`;
                    }
                    await messageUtils.sendSuccess({
                        target: msg.channel, 
                        valString: resString
                    });
                }
                else {
                    return await messageUtils.sendError({
                        target: msg.channel, 
                        valString: `The following error occured: \`Key was not found\``
                    });
                }
            }
            else {
                data = await this.client.provider.get(key, field, null);
                if(!data) {
                    return await messageUtils.sendError({
                        target: msg.channel, 
                        valString: `The following error occured: \`Key/Field was not found\``
                    });
                }
                await messageUtils.sendSuccess({
                    target: msg.channel, 
                    valString: `**Key:** \`${key}\`\n**Field:** \`${field}\`\n**Result:** \`${data}\``
                });
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