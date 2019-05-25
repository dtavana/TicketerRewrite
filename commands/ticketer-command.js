const { Command, permissions } = require('discord.js-commando');
const messageUtils = require('../utils/messageUtils');
const { oneLine, stripIndents } = require('common-tags');
const { escapeMarkdown } = require('discord.js');

module.exports = class TicketerCommand extends Command {
    constructor(client, info) {
        super(client, info);
    }

    async checkAdminRole(client, member, guild) {
        let adminRole = await client.provider.get(guild, 'adminRole', null);
        let hasRole = member.roles.has(adminRole);
        let aRole = await guild.roles.get(adminRole);
        if(!aRole) {
            aRole = '**NOT FOUND**';
        }
        else {
            aRole = aRole.toString();
        }
        return {
            state: hasRole,
            admin: aRole
        };
    }

    async checkTicketerRole(client, member, guild) {
        let adminRole = await client.provider.get(guild, 'adminRole', null);
        let moderatorRole = await client.provider.get(guild, 'moderatorRole', null);
        let hasRole = member.roles.has(adminRole) || member.roles.has(moderatorRole);
        let aRole = await guild.roles.get(adminRole);
        let mRole = await guild.roles.get(moderatorRole);
        if(!aRole) {
            aRole = '**NOT FOUND**';
        }
        else {
            aRole = aRole.toString();
        }
        if(!mRole) {
            mRole = '**NOT FOUND**';
        }
        else {
            mRole = mRole.toString();
        }

        return {
            state: hasRole,
            admin: aRole,
            moderator: mRole
        };
    }
    
    async checkPremium(client, msg) {
        let res = await client.provider.pg.oneOrNone('SELECT key FROM premium WHERE serverid = $1;', [msg.guild.id]);
        if(!res) {
            return false;
        }
        return true;
    }
    
    onError(err, message) {
        const owners = this.client.owners;
        const ownerList = owners ? owners.map((usr, i) => {
            const or = i === owners.length - 1 && owners.length > 1 ? 'or ' : '';
            return `${or}${escapeMarkdown(usr.username)}#${usr.discriminator}`;
        }).join(owners.length > 2 ? ', ' : ' ') : '';

        const invite = this.client.options.invite;
        let resStr = stripIndents`
            An error occurred while running the command: \`${err.name}: ${err.message}\`
            You shouldn't ever receive an error like this.
            Please contact ${ownerList || 'the bot owner'}${invite ? ` in this server: ${invite}` : '.'}
            `;
        messageUtils.sendError({
            target: message.channel, 
            valString: resStr,
            client: this.client,
            messages: [message],
            guild: message.guild
        })
            .then(res => {
                return res;
            });
    }

    onBlock(message, reason, data) {
        var resStr;
        switch(reason) {
        case 'guildOnly':
            resStr = `The \`${this.name}\` command must be used in a server channel.`;
            break;
        case 'nsfw':
            resStr = `The \`${this.name}\` command can only be used in NSFW channels.`;
            break;
        case 'permission': {
            if(data.response) resStr = data.response;
            else resStr = `You do not have permission to use the \`${this.name}\` command.`;
            break;
        }
        case 'clientPermissions': {
            if(data.missing.length === 1) {
                resStr = `I need the "${permissions[data.missing[0]]}" permission for the \`${this.name}\` command to work.`;
                break;
            }
            else {
                resStr = oneLine`
                        I need the following permissions for the \`${this.name}\` command to work:
                        ${data.missing.map(perm => permissions[perm]).join(', ')}
                        `;
                break;
            }
        }
        case 'throttling': {
            resStr = `You may not use the \`${this.name}\` command again for another ${data.remaining.toFixed(1)} seconds.`;
            break;
        }
        default:
            resStr =  null;
        }
        if(resStr === null) return null;
        messageUtils.sendError({
            target: message.channel, 
            valString: resStr,
            client: this.client,
            messages: [message],
            guild: message.guild
        })
            .then(result => {
                return result;
            });
        
    }

};