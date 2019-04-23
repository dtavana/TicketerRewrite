const TicketerCommand  = require('../ticketer-command')
const Discord = require('discord.js')
const messageUtils = require('../../utils/messageUtils')
const donateUtils = require('../../utils/donateUtils')

module.exports = class SetCleanAll extends TicketerCommand {
	constructor(client) {
		super(client, {
			name: 'withdraw',
			aliases: [],
			group: 'credits',
			memberName: 'withdraw',
            description: 'Withdraws a currently enabled credit. **NOTE:** Can only be run by the user who enabled premium on the server',
            guildOnly: true,
		});
    }
    
    async run(msg, {cleanAll}, fromPattern, result) {
        let ownerId = await donateUtils.getCreditOwner(this.client, msg.guild.id);
        if(ownerId === null) {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: `This server does not have premium enabled! Please use the \`${msg.guild.commandPrefix}upgrade\` command in order to purchase premium.`,
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }
        ownerId = ownerId.userid;
        if(msg.author.id != ownerId) {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: `This command can only be run by the user that redeemed the credit. If this is in error, join our support server using the \`${msg.guild.commandPrefix}support\` command.`,
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }
        let key = await donateUtils.disableCredit(this.client, msg.guild.id);
        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: `Credit with key \`${key}\` has been disabled in this guild and is ready for use in another guild.`,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });
        this.client.provider.guilds = this.client.provider.guilds.filter(id => id != msg.guild.id);
    }
};