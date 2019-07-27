const PremiumCommand  = require('../premium-command');
const messageUtils = require('../../utils/messageUtils');

module.exports = class InactiveCommand extends PremiumCommand {
    constructor(client) {
        super(client, {
            name: 'inactive',
            aliases: ['setinactive'],
            group: 'tickets',
            memberName: 'inactive',
            description: 'Marks a ticket as inactive',
            guildOnly: true,
            args: [
                {
                    key: 'channel',
                    type: 'channel',
                    prompt: 'Please tag the desired ticket channel.',
                    default: false
                }
            ]
        });
    }
    
    async run(msg, {channel}, fromPattern, result) {
        if(!channel) channel = msg.channel;
        let ticketData = await this.client.provider.get(`${msg.guild.id}-channels`, channel.id, null);
        if(!ticketData) {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: `${channel.toString()} is not detected as a ticket channel`,
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }
        ticketData = JSON.parse(ticketData);
        let ticketOwner = ticketData.author;
        ticketOwner = this.client.users.get(ticketOwner);

        let adminClose = await this.client.provider.get(msg.guild.id, 'adminClose', null);

        let exists = await this.client.provider.pg.oneOrNone(`SELECT * FROM inactive where ticketid = $1;`, channel.id);
        if(exists) {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: `${channel.toString()} has already been marked as inactive`,
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }

        if(adminClose) {
            let hasAdmin = await this.checkAdminRole(this.client, msg.member, msg.guild);
            if(!hasAdmin.state) {
                return await messageUtils.sendError({
                    target: msg.channel, 
                    valString: `In order to mark a ticket as inactive, you must have the ${hasAdmin.admin} role`,
                    client: this.client,
                    messages: [msg].concat(result.prompts, result.answers),
                    guild: msg.guild
                });
            }
        }
        else {
            let hasAdmin = await this.checkTicketerRole(this.client, msg.member, msg.guild);
            if(!hasAdmin.state) {
                return await messageUtils.sendError({
                    target: msg.channel, 
                    valString: `In order to mark a ticket as inactive, you must have the ${hasAdmin.admin} role or the ${hasAdmin.moderator} role`,
                    client: this.client,
                    messages: [msg].concat(result.prompts, result.answers),
                    guild: msg.guild
                });
            }
        }
        
        let inactiveTime = await this.client.provider.get(msg.guild.id, 'inactiveTime', null);
        if(!inactiveTime) {
            inactiveTime = 120;
        }

        await this.client.provider.pg.none(`INSERT INTO inactive (ticketid, serverid, expires) VALUES ($1, $2, date_trunc(\'minute\', NOW() + interval \'${inactiveTime} minutes\'));`, [channel.id, msg.guild.id]);
        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: `${channel.toString()} has been marked as inactive and will be deleted in **${inactiveTime} minutes**. Use the \`${msg.guild.commandPrefix}active\` command to reactivate this ticket`,
            client: null
        });
        if(ticketOwner) {
            await messageUtils.sendNotice({
                target: ticketOwner, 
                valString: `\`${channel.name}\` in **${msg.guild.name}** has been marked as inactive and will be deleted in **${inactiveTime} minutes**. Use the \`${msg.guild.commandPrefix}active\` command to reactivate your ticket`,
                client: this.null
            });
        }
        await messageUtils.sendTicketManipulation(
            this.client,
            msg.guild,
            msg.author,
            null,
            channel.name,
            'YELLOW',
            `\`${channel.name}\` has been marked as inactive and will be deleted in **${inactiveTime} minutes**`
        );
    }
};