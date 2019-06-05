const PremiumCommand  = require('../premium-command');
const messageUtils = require('../../utils/messageUtils');

module.exports = class JoinWelcomeMessage extends PremiumCommand {
    constructor(client) {
        super(client, {
            name: 'joinwelcomemessage',
            aliases: ['setjoinwelcomemessage'],
            group: 'settings',
            memberName: 'joinwelcomemessage',
            description: 'Sets the welcome message for the ticket created when a user joins',
            guildOnly: true,
            userPermissions: ['MANAGE_GUILD'],
            args: [
                {
                    key: 'welcomeMessage',
                    prompt: 'Please enter the desired welcomeMessage. **NOTE:** must be 2000 characters or less. **NOTE:** requires `ticketonjoin` to be turned on.',
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

        await this.client.provider.set(msg.guild.id, 'joinWelcomeMessage', welcomeMessage);
        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: `New Join Welcome Message:\n${welcomeMessage}`,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });

    }
};