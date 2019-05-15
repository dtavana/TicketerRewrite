const TicketerCommand  = require('../ticketer-command');
const messageUtils = require('../../utils/messageUtils');

module.exports = class ViewSettingsCommand extends TicketerCommand {
    constructor(client) {
        super(client, {
            name: 'viewsettings',
            aliases: [],
            group: 'settings',
            memberName: 'viewsettings',
            description: 'Displays current settings for the guild.',
            guildOnly: true
        });
    }
    
    async run(msg, fromPattern, result) {
        let settings = await this.client.provider.getSettings(msg.guild.id);
        if(!settings || settings.size === 0) {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: `No settings were detected for **${msg.guild.name}**.`,
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }
        let resString = "";
        let channels = ["logChannel", "transcriptChannel"];
        let roles = ["moderatorRole", "adminRole"];
        for(let setting of Object.entries(settings)) {
            let key = setting[0];
            let value = setting[1];
            if(channels.includes(key)) {
                value = msg.guild.channels.get(value);
                if(!value) value = "**NOT FOUND**";
                else value = value.toString();
            }
            else if(roles.includes(key)) {
                value = msg.guild.roles.get(value);
                if(!value) value = "**NOT FOUND**";
                else value = value.toString();
            }
            else value = `\`${value}\``;
            resString += `**${key.toUpperCase()}** | ${value}\n`;
        }
        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: resString += `\nTo view your current ticket channel configurations, use the \`${msg.guild.commandPrefix}channels\` command.`,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });
    }
};