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
            description: 'Creates and saves a new ticket configuration',
            userPermissions: ['MANAGE_GUILD'],
            guildOnly: true,
            args: [
                {
                    key: 'ticketchannel',
                    prompt: 'Please tag the desired ticket creation channel',
                    type: 'channel'
                }
            ]
        });
    }
    
    async run(msg, {ticketchannel}, fromPattern, result) {
        let premium = await this.checkPremium(this.client, msg);
        let data = await settingsUtils.initializeServer(this.client, msg.guild, ticketchannel, premium);
        if(typeof data === "string") {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: data,
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }
        let role = data.role;
        let category = data.category;

        await msg.member.roles.add(role, "Ticketer Setup");

        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: `I have created the admin role ${role.toString()} as well as the ticket category \`${category.name}\` bound to ${ticketchannel.toString()}. Make sure you give any staff you would like to be able to use Ticketer Admin commands the newly created role. **DO NOT** delete any of these, doing so will require you to run this command again. Feel free to rename any of these.`,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });
    }
};