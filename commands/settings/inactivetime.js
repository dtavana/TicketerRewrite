const PremiumCommand  = require('../premium-command');
const messageUtils = require('../../utils/messageUtils');

module.exports = class InactiveTimeCommand extends PremiumCommand {
    constructor(client) {
        super(client, {
            name: 'inactivetime',
            aliases: ['setinactivetime'],
            group: 'settings',
            memberName: 'inactivetime',
            description: 'Sets the amount of time **in minutes** it should take for a ticket to be deleted once marked as inactive',
            guildOnly: true,
            userPermissions: ['MANAGE_GUILD'],
            args: [
                {
                    key: 'inactiveTime',
                    prompt: 'Please enter the time **in minutes** it should take for a ticket to be deleted once marked as inactive.',
                    type: 'integer'
                }
            ]
        });
    }
    
    async run(msg, {inactiveTime}, fromPattern, result) {
        let res = await this.client.provider.set(msg.guild.id, 'inactiveTime', inactiveTime);
        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: `Old Inactive Time: \`${res} minute(s)\`\n\nNew Inactive Time: \`${inactiveTime} minute(s)\``,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });

    }
};