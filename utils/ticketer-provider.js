const { SettingProvider } = require('discord.js-commando');
require('dotenv').config();
const subpubController = require('../controllers/subpub.controller');

class TicketerProvider extends SettingProvider {
    constructor(pg, redis, sub, pub) {
        super();
        this.pg = pg;
        this.redis = redis;
        this.sub = sub;
        this.pub = pub;
        Object.defineProperty(this, 'client', { value: null, writable: true });

        this.guilds = [];
        this.listeners = new Map();
    }

    async init(client) {
        this.client = client;

        await this.pg.none('CREATE TABLE IF NOT EXISTS servers(serverid varchar PRIMARY KEY, currentticket smallint DEFAULT 1, setup boolean DEFAULT FALSE, userid varchar);');
        await this.pg.none('CREATE TABLE IF NOT EXISTS premium(userid varchar, serverid varchar, key varchar, enabled boolean DEFAULT FALSE, paymentid varchar DEFAULT 0);');
        await this.pg.none('CREATE TABLE IF NOT EXISTS blacklist(userid varchar, serverid varchar);');
        await this.pg.none('CREATE TABLE IF NOT EXISTS payments(userid varchar, paymentid varchar);');
        await this.pg.none('CREATE TABLE IF NOT EXISTS votes(userid varchar PRIMARY KEY, count smallint);');

        // Load all settings
        const guilds = await this.pg.manyOrNone('SELECT serverid FROM premium WHERE enabled = True;');
        for(let guildId of guilds) {
            guildId = guildId.serverid;
            this.guilds.push(guildId);
            let settings;
            settings = await this.getSettings(guildId);
            if(settings === null) {
                continue;
            }
            this.setupGuild(guildId, settings);
        }
		
        //Redis pipelines
        this.sub.on('message', async(channel, message) => {
            await subpubController.handleIncomingMessage(client, channel, message);
        });
        this.sub.subscribe(process.env.VOTE_CHANNEL, (err) => {
            if(err) {
                throw new Error(err);
            }
        });
        this.sub.subscribe(process.env.DONATE_CHANNEL, (err) => {
            if(err) {
                throw new Error(err);
            }
        });
		
		
        // Listen for changes
        this.listeners
            .set('commandPrefixChange', async(guild, prefix) => await this.set(guild, 'prefix', prefix))
            .set('commandStatusChange', async(guild, command, enabled) => await this.set(guild, `cmd-${command.name}`, enabled))
            .set('groupStatusChange', async(guild, group, enabled) => await this.set(guild, `grp-${group.id}`, enabled))
            .set('guildCreate', async(guild) => {
                const settings = await this.getSettings(guild.id);
                if(!settings) return;
                this.setupGuild(guild.id, settings);
            })
            .set('commandRegister', async(command) => {
                for(const guild of this.guilds) {
                    if(guild !== 'global' && !client.guilds.has(guild)) continue;
                    const settings = await this.getSettings(guild);
                    this.setupGuildCommand(client.guilds.get(guild), command, settings);
                }
            })
            .set('groupRegister', async(group) => {
                for(const guild of this.guilds) {
                    if(guild !== 'global' && !client.guilds.has(guild)) continue;
                    const settings = await this.getSettings(guild);
                    this.setupGuildGroup(client.guilds.get(guild), group, settings);
                }
            });
        for(const [event, listener] of this.listeners) client.on(event, listener);
    }
    
    async destroy() {
        // Remove all listeners from the client
        for(const [event, listener] of this.listeners) this.client.removeListener(event, listener);
        this.listeners.clear();
    }

    async getSettings(guildId) {
        let settings = await this.redis.hgetall(guildId);
        return settings;
    }

    async get(guild, key, defVal) {
        const settings = await this.getSettings(this.constructor.getGuildID(guild));
        return settings ? typeof settings[key] !== null ? settings[key] : defVal : defVal;
    }

    async set(guild, key, val) {
        guild = this.constructor.getGuildID(guild);
        let settings = await this.getSettings(guild);
        let premium = await this.client.provider.pg.oneOrNone('SELECT key FROM premium WHERE serverid = $1;', [guild]);
        if(!settings && premium) {
            this.guilds.push(guild);
        }
		
        await this.redis.hset(guild !== 'global' ? guild : 0, key, val);
        if(guild === 'global') this.updateOtherShards(key, val);
        try {
            return settings[key];
        }
        catch {
            return null;
        }
    }

    async remove(guild, key) {
        guild = this.constructor.getGuildID(guild);
        const settings = await this.getSettings(guild);
        if(!settings || typeof settings[key] === null) return undefined;

        const val = settings[key];
        await this.redis.hdel(guild !== 'global' ? guild : 0, key);
        if(guild === 'global') this.updateOtherShards(key, undefined);
        return val;
    }

    async clear(guild) {
        guild = this.constructor.getGuildID(guild);
        const settings = await this.getSettings(guild);
        this.guilds = this.guilds.filter(id => id != guild);
        if(!settings) return;
        await this.redis.del(guild !== 'global' ? guild : 0);
    }

    /**
	 * Loads all settings for a guild
	 * @param {string} guild - Guild ID to load the settings of (or 'global')
	 * @param {Object} settings - Settings to load
	 * @private
	 */
    setupGuild(guild, settings) {
        if(typeof guild !== 'string') throw new TypeError('The guild must be a guild ID or "global".');
        guild = this.client.guilds.get(guild) || null;

        // Load the command prefix
        if(typeof settings.prefix !== 'undefined') {
            if(guild) guild._commandPrefix = settings.prefix;
            else this.client._commandPrefix = settings.prefix;
        }

        // Load all command/group statuses
        for(const command of this.client.registry.commands.values()) this.setupGuildCommand(guild, command, settings);
        for(const group of this.client.registry.groups.values()) this.setupGuildGroup(guild, group, settings);
    }

    /**
	 * Sets up a command's status in a guild from the guild's settings
	 * @param {?CommandoGuild} guild - Guild to set the status in
	 * @param {Command} command - Command to set the status of
	 * @param {Object} settings - Settings of the guild
	 * @private
	 */
    setupGuildCommand(guild, command, settings) {
        if(typeof settings[`cmd-${command.name}`] === 'undefined') return;
        if(guild) {
            if(!guild._commandsEnabled) guild._commandsEnabled = {};
            guild._commandsEnabled[command.name] = settings[`cmd-${command.name}`];
        } else {
            command._globalEnabled = settings[`cmd-${command.name}`];
        }
    }

    /**
	 * Sets up a command group's status in a guild from the guild's settings
	 * @param {?CommandoGuild} guild - Guild to set the status in
	 * @param {CommandGroup} group - Group to set the status of
	 * @param {Object} settings - Settings of the guild
	 * @private
	 */
    setupGuildGroup(guild, group, settings) {
        if(typeof settings[`grp-${group.id}`] === 'undefined') return;
        if(guild) {
            if(!guild._groupsEnabled) guild._groupsEnabled = {};
            guild._groupsEnabled[group.id] = settings[`grp-${group.id}`];
        } else {
            group._globalEnabled = settings[`grp-${group.id}`];
        }
    }

    /**
	 * Updates a global setting on all other shards if using the {@link ShardingManager}.
	 * @param {string} key - Key of the setting to update
	 * @param {*} val - Value of the setting
	 * @private
	 */
    updateOtherShards(key, val) {
        if(!this.client.shard) return;
        key = JSON.stringify(key);
        val = typeof val !== 'undefined' ? JSON.stringify(val) : 'undefined';
        this.client.shard.broadcastEval(`
			if(this.shard.id !== ${this.client.shard.id} && this.provider && this.provider.settings) {
				let global = this.provider.settings.get('global');
				if(!global) {
					global = {};
					this.provider.settings.set('global', global);
				}
				global[${key}] = ${val};
			}
		`);
    }
}

module.exports = TicketerProvider;