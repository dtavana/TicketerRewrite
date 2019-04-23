const TicketerCommand  = require('../ticketer-command');
const messageUtils = require('../../utils/messageUtils');
const settingsUtils = require('../../utils/settingsUtils');

module.exports = class SetupCommand extends TicketerCommand {
    constructor(client) {
        super(client, {
            name: 'setup',
            aliases: [],
            group: 'settings',
            memberName: 'setup',
            description: 'Creates and saves the default Category and Ticket Role',
            guildOnly: true,
        });
    }
    
    async run(msg, fromPattern, result) {
        let data = await settingsUtils.initializeServer(this.client, msg.guild);
        let role = data.role;
        let category = data.category;

        await msg.member.roles.add(role, "Ticketer Setup");

        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: `I have created the admin role ${role.toString()} as well as the ticket category \`${category.name}\`. Make sure you give any staff you would like to be able to use Ticketer Admin commands the newly created role. **DO NOT** delete either of these, doing so will require you to run this command again. Feel free to rename both of these.`,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });
    }
};