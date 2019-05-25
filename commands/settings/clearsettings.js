const TicketerCommand  = require('../ticketer-command');
const messageUtils = require('../../utils/messageUtils');

module.exports = class ClearSettingsCommand extends TicketerCommand {
    constructor(client) {
        super(client, {
            name: 'clearsettings',
            aliases: [],
            group: 'settings',
            memberName: 'clearsettings',
            description: 'Clears settings for this guild.',
            guildOnly: true,
            userPermissions: ['MANAGE_GUILD']
        });
    }
    
    async run(msg, fromPattern, result) {
        let collector = await messageUtils.sendWaiting({
            target: msg.channel, 
            valString: 'Clear guild settings',
            message: msg
        });
        collector.on('end', async(collected) => {
            if(collected.has('✅')) {
                await this.client.provider.clear(msg.guild);
                await this.client.provider.clear(`${msg.guild.id}-channels`);
                if(this.client.provider.ticketChannelCollectors.has(msg.guild.id)) {
                    for(let ticketCollector of this.client.provider.ticketChannelCollectors.get(msg.guild.id)) {
                        ticketCollector.stop();
                    }
                    this.client.provider.ticketChannelCollectors.delete(msg.guild.id);
                }
                return await messageUtils.sendSuccess({
                    target: msg.channel, 
                    valString: `**${msg.guild.name}** has had its settings cleared.`,
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