const TicketerCommand  = require('../ticketer-command');
const messageUtils = require('../../utils/messageUtils');
const _ = require('lodash');

module.exports = class TicketStatsCommand extends TicketerCommand {
    constructor(client) {
        super(client, {
            name: 'ticketstats',
            aliases: [],
            group: 'info',
            memberName: 'ticketstats',
            description: 'Displays information about the how many tickets users have closed.'
        });
    }
    
    async run(msg, fromPattern, result) {
        let hasAdmin = await this.checkTicketerRole(this.client, msg.member, msg.guild);
        if(!hasAdmin.state) {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: `In order to view ticket stats, you must have the ${hasAdmin.admin} role or the ${hasAdmin.moderator} role`,
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }
            
        let ticketTracking = await this.client.provider.get(msg.guild, 'ticketTracking', null);
        if(!ticketTracking || _.isEmpty(ticketTracking)) {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: 'No stats for this guild have been tracked.',
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }

        ticketTracking = JSON.parse(ticketTracking);

        let sorted = [];
        let sortedNums = Object.values(ticketTracking).sort((a, b) => b - a);

        for(let el of Object.entries(ticketTracking)) {
            let index = sortedNums.indexOf(el[1]);
            sorted.splice(index, 0, el);
        }

        let res = '';

        for (let staff of sorted) {
            let member = msg.guild.members.get(staff[0]);
            if(!member) continue;
            let staffHasAdmin = await this.checkTicketerRole(this.client, member, msg.guild);
            if(!staffHasAdmin.state) continue;
            res += `\`${member.user.tag}\` | **${staff[1]}**\n`;
        }
        await messageUtils.sendSuccess({
            target: msg.channel, 
            valString: res,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });
    }
};