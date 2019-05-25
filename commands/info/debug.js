const TicketerCommand  = require('../ticketer-command');
const messageUtils = require('../../utils/messageUtils');

module.exports = class DebugCommand extends TicketerCommand {
    constructor(client) {
        super(client, {
            name: 'debug',
            aliases: [],
            group: 'info',
            memberName: 'debug',
            description: 'Displays debug information',
            guildOnly: true
        });
    }
    
    async run(msg, fromPattern, result) {
        const PERMS = {
            "MANAGE_ROLES": "Manage Roles", 
            "READ_MESSAGE_HISTORY": "Read Message History", 
            "EMBED_LINKS": "Embed Links", 
            "ATTACH_FILES": "Attach Files", 
            "MANAGE_CHANNELS": "Manage Channels", 
            "ADD_REACTIONS": "Add Reactions", 
            "VIEW_AUDIT_LOG": "View Audit Log", 
            "VIEW_CHANNELS": "View Channels", 
            "SEND_MESSAGES": "Send Messages", 
            "MANAGE_MESSAGES": "Manage Messages", 
            "USE_EXTERNAL_EMOJIS": "Use External Emojis", 
            "MANAGE_WEBHOOKS": "Manage Webhooks"
        };
        const VALID = "✅";
        const INVALID = "❌";

        let channelPerms = msg.channel.permissionsFor(this.client.user).serialize();
        let guildPerms = msg.guild.me.permissions.serialize();

        let channelStr = "";
        let guildStr = "";

        for(let perm of Object.entries(PERMS)) {
            if(channelPerms[perm[0]]) channelStr += `${VALID} ~ ${perm[1]}\n`;
            else channelStr += `${INVALID} ~ ${perm[1]}\n`;

            if(guildPerms[perm[0]]) guildStr += `${VALID} ~ ${perm[1]}\n`;
            else guildStr += `${INVALID} ~ ${perm[1]}\n`;
        }

        await messageUtils.sendDebug({
            target: msg.author, 
            channelString: channelStr,
            guildString: guildStr,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });
    }
};