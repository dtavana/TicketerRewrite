const PremiumCommand  = require('../premium-command');
const messageUtils = require('../../utils/messageUtils');

module.exports = class SetWelcomeMessage extends PremiumCommand {
    constructor(client) {
        super(client, {
            name: 'setwelcomemessage',
            aliases: [],
            group: 'settings',
            memberName: 'setwelcomemessage',
            description: 'Sets the welcome message for a new ticket',
            guildOnly: true,
            userPermissions: ['MANAGE_GUILD'],
            args: [
                {
                    key: 'welcomeMessage',
                    prompt: 'Please enter the desired welcomeMessage. **NOTE:** must be 2000 characters or less',
                    type: 'string'
                }
            ]
        });
    }
    
    async run(msg, {welcomeMessage}, fromPattern, result) {
        if(welcomeMessage.length > 2000) {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: 'Welcome message must be under 2000 characters.',
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }

        await this.client.provider.set(msg.guild.id, 'welcomeMessage', welcomeMessage);
        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: `New Welcome Message:\n${welcomeMessage}`,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });

    }
};