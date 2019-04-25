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

        await msg.member.roles.add(roles.adminRole, "Ticketer Setup");

        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: `I have deleted the old Ticketer Roles if they existed and created ${roles.adminRole.toString()} and ${roles.moderatorRole.toString()}. Both roles have access to view tickets but only the admin role may manipulate the ticket (\`${msg.guild.commandPrefix}close\`). **DO NOT** delete these roles. If you do, you should rerun this command. Feel free to rename and manipulate these in any other way.`,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });

        /*
        if(typeof data === "string") {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: data,
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }
        let adminRole = data.adminRole;
        let moderatorRole = data.moderatorRole;
        let category = data.category;

        await msg.member.roles.add(adminRole, "Ticketer Setup");

        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: `I have created the admin role ${adminRole.toString()} and the moderator role ${moderatorRole.toString()}. I have also created the ticket category \`${category.name}\` bound to ${ticketchannel.toString()}. Make sure you give any staff you would like to be able to use Ticketer Admin commands the newly created role. **DO NOT** delete any of these, doing so will require you to run this command again. Feel free to rename any of these.`,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });
        */
    }
};