const TicketerCommand  = require('../ticketer-command');
const messageUtils = require('../../utils/messageUtils');
const settingsUtils = require('../../utils/settingsUtils');

module.exports = class SetupRolesCommand extends TicketerCommand {
    constructor(client) {
        super(client, {
            name: 'setuproles',
            aliases: [],
            group: 'settings',
            memberName: 'setuproles',
            description: 'Creates and saves the Ticketer Roles',
            userPermissions: ['MANAGE_GUILD'],
            guildOnly: true
        });
    }
    
    async run(msg, fromPattern, result) {
        let roles = await settingsUtils.initializeRoles(this.client, msg.guild);

        if(typeof roles === "string") {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: data,
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }

        await msg.member.roles.add(roles.adminRole, "Ticketer Setup");

        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: `I have deleted the old Ticketer Roles if they existed and created ${roles.adminRole.toString()} and ${roles.moderatorRole.toString()}. Both roles have access to view tickets but only the admin role may manipulate the ticket (\`${msg.guild.commandPrefix}close\`). **DO NOT** delete these roles. If you do, you should rerun this command. Feel free to rename and manipulate these in any other way.`,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });
    }
};