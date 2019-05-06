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
                    prompt: 'Please enter the desired prefix',
                    type: 'string'
                }
            ]
        });
    }
    
    async run(msg, {prefix}, fromPattern, result) {
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