const PremiumCommand  = require('../premium-command');
const messageUtils = require('../../utils/messageUtils');

module.exports = class SetPrefixCommand extends PremiumCommand {
    constructor(client) {
        super(client, {
            name: 'setprefix',
            aliases: [],
            group: 'settings',
            memberName: 'setprefix',
            description: 'Sets the prefix for a guild',
            guildOnly: true,
            userPermissions: ['MANAGE_GUILD'],
            args: [
                {
                    key: 'prefix',
                    prompt: 'Please enter the desired prefix. **NOTE:** Must be less than 5 characters.',
                    type: 'string'
                }
            ]
        });
    }
    
    async run(msg, {prefix}, fromPattern, result) {
        if(prefix.length > 5) {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: 'Prefix must be under 2000 characters.',
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }
        let res = await this.client.provider.set(msg.guild.id, 'prefix', prefix);
        msg.guild.commandPrefix = prefix;
        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: `Old Prefix: \`${res}\`\n\nNew Prefix: \`${prefix}\``,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });

    }
};