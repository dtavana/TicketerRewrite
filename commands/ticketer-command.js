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
};