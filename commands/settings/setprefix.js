const PremiumCommand  = require('../premium-command');
const messageUtils = require('../../utils/messageUtils');

module.exports = class SetPrefix extends PremiumCommand {
    constructor(client) {
        super(client, {
            name: 'setprefix',
            aliases: [],
            group: 'settings',
            memberName: 'setprefix',
            description: 'Sets the prefix for a guild',
            guildOnly: true,
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
        let premium = await this.checkPremium(this.client, msg);
        if(!premium) {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: `This is a premium command. Please use the ${msg.guild.commandPrefix}upgrade command in order to purchase premium.`,
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