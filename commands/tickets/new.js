const TicketerCommand  = require('../ticketer-command');
const { User } = require('discord.js');
const messageUtils = require('../../utils/messageUtils');
const ticketUtils = require('../../utils/ticketUtils');
const moderationUtils = require('../../utils/moderationUtils');

module.exports = class NewCommand extends TicketerCommand {
    constructor(client) {
        super(client, {
            name: 'new',
            aliases: ['ticket', 'support'],
            group: 'tickets',
            memberName: 'new',
            description: 'Opens a new ticket',
            guildOnly: true,
            args: [
                {
                    key: 'subject',
                    type: 'strictuser|string',
                    prompt: 'Please enter the desired subject. **NOTE:** For Ticketer Admins, you may tag a user to open a ticket on another user\'s behalf.',
                    default: false
                }
            ]
        });
    }
    
    async run(msg, {subject}, fromPattern, result) {
        let blacklist = await moderationUtils.getBlacklisted(this.client, msg.author, msg.guild);
        if(blacklist) {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: `${msg.author.toString()} is currently blacklisted in **${msg.guild.name}**`,
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }

        if(!!subject && subject.length > 500) {
            subject = subject.substring(0, 500) + '** ...**';
        }
        
        let target;
        if(subject === false) {
            let enforceSubject = await this.client.provider.get(msg.guild, 'enforceSubject', null);
            if(enforceSubject === true) {
                return await messageUtils.sendError({
                    target: msg.channel, 
                    valString: 'This guild has required the use of a subject when creating a ticket.',
                    client: this.client,
                    messages: [msg].concat(result.prompts, result.answers),
                    guild: msg.guild
                });
            }
        }
        if(subject instanceof User) {
            let hasAdmin = await this.checkTicketerRole(this.client, msg.member, msg.guild);
            if(!hasAdmin.state) {
                return await messageUtils.sendError({
                    target: msg.channel, 
                    valString: `In order to tag the user as the subject, you must have the ${hasAdmin.admin} role. If you believe this is in error, make sure you have the role.`,
                    client: this.client,
                    messages: [msg].concat(result.prompts, result.answers),
                    guild: msg.guild
                });
            }
            target = subject;
            subject = 'None provided';
        }
        else {
            target = msg.author;
            if(!subject) {
                subject = 'None provided';
            }
        }


        let channel = await ticketUtils.openTicket(this.client, msg.guild, msg.channel, target, subject);

        if(typeof channel === 'string') {
            return await messageUtils.sendError({
                target: msg.channel, 
                valString: channel,
                client: this.client,
                messages: [msg].concat(result.prompts, result.answers),
                guild: msg.guild
            });
        }

        await messageUtils.sendNewTicket({
            target: msg.channel, 
            valString: `${target.toString()} your ticket has been opened, click here: ${channel.toString()}`,
            client: this.client,
            messages: [msg].concat(result.prompts, result.answers),
            guild: msg.guild
        });

        let welcomeMessage = await this.client.provider.get(msg.guild, 'welcomeMessage', null);
        if(!welcomeMessage) {
            welcomeMessage = 'Thank you for opening a new ticket. Support will be with you shortly.';
        }

        await messageUtils.sendOpenedTicket(this.client, channel, welcomeMessage, subject, msg.guild, target);


    }
};