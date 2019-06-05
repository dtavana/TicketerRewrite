const TicketerCommand  = require('../ticketer-command');
const messageUtils = require('../../utils/messageUtils');

module.exports = class ClearChannelsCommand extends TicketerCommand {
    constructor(client) {
        super(client, {
            name: 'clearchannels',
            aliases: [],
            group: 'settings',
            memberName: 'clearchannels',
            description: 'Disassociates ticket channels for this guild.',
            guildOnly: true,
            userPermissions: ['MANAGE_GUILD']
        });
    }
    
    async run(msg, fromPattern, result) {
        let collector = await messageUtils.sendWaiting({
            target: msg.channel, 
            valString: 'Clear ticket channels',
            message: msg
        });
        collector.on('end', async(collected) => {
            if(collected.has('✅')) {
                let ticketChannels = await this.client.provider.get(msg.guild.id, 'ticketchannels', null);
                if(!ticketChannels) {
                    return await messageUtils.sendError({
                        target: msg.channel, 
                        valString: 'There are no ticket channels to be cleared.',
                        client: this.client,
                        messages: [msg].concat(result.prompts, result.answers),
                        guild: msg.guild
                    });
                }
                await this.client.provider.remove(msg.guild.id, 'ticketchannels');
                return await messageUtils.sendSuccess({
                    target: msg.channel, 
                    valString: `**${msg.guild.name}** has had its ticket channels cleared.`,
                    client: this.client,
                    messages: [msg].concat(result.prompts, result.answers),
                    guild: msg.guild
                });
            }
            else {
                return await messageUtils.sendError({
                    target: msg.channel, 
                    valString: 'The current operation has been cancelled.',
                    client: this.client,
                    messages: [msg].concat(result.prompts, result.answers),
                    guild: msg.guild
                });
            }
        });
    }
};