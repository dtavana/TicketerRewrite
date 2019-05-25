const TicketerCommand = require('./ticketer-command');
const { permissions } = require('discord.js-commando');
const { oneLine } = require('common-tags');

module.exports = class StaffCommand extends TicketerCommand {
    constructor(client, info) {
        super(client, info);
        this.STAFF = ['112762841173368832'];
    }

    hasPermission(message) {
        if(!this.STAFF.includes(message.author.id)) {
            return 'This is a Ticketer Staff command.';
        }
        
        if(this.ownerOnly && !this.client.isOwner(message.author)) {
            return `The \`${this.name}\` command can only be used by the bot owner.`;
        }

        if(message.channel.type === 'text' && this.userPermissions) {
            const missing = message.channel.permissionsFor(message.author).missing(this.userPermissions);
            if(missing.length > 0) {
                if(missing.length === 1) {
                    return `The \`${this.name}\` command requires you to have the "${permissions[missing[0]]}" permission.`;
                }
                return oneLine`
					The \`${this.name}\` command requires you to have the following permissions:
					${missing.map(perm => permissions[perm]).join(', ')}
				`;
            }
        }

        return true;
    }

};