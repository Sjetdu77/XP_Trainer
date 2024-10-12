const fs = require('node:fs');
const path = require('node:path');
const {
	Client,
	Events,
	Collection,
	GatewayIntentBits,
	ActionRowBuilder,
    StringSelectMenuBuilder,
} = require('discord.js');
const { token } = require('./config.json');
const { Pokemon_Creature, synchronize } = require('./classes.js');
const { Op } = require("sequelize");
const { Stock } = require('./datas/stock');

let clientId = null;

// Create a new client instance
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers
	]
});

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, async c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
    await synchronize();
	clientId = client.user.id;
});

client.login(token);
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.on(Events.InteractionCreate, async interaction => {
    const userId = interaction.user.id;

    if (interaction.isChatInputCommand()) {
		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	} else if (interaction.isStringSelectMenu()) {
		const selected = interaction.values;
		const [trainer] = Stock.trainerSaved[userId];
		const allCreaturesTeam = await trainer.getCreatures({ where: { place: 'team' } });
		const allCreaturesPC = await trainer.getCreatures({ where: { place: 'computer' } });

		switch (interaction.customId) {
			case 'winners':
				let content = ``;
				for (const creature of allCreaturesTeam) {
					const specie = await creature.getSpecie();
					const gains = await creature.gainXPViaFoe(Stock.creatureSaved[trainer.id], selected.includes(`${creature.id}`));
					content += `${creature.nickname ? creature.nickname : specie.name} gagne ${gains[0]} points d'expérience.\n`;
					if (gains[1] > 0) {
						content += `${creature.nickname ? creature.nickname : specie.name} gagne ${gains[1]} niveau${gains[1] > 1 ? 'x' : ''}.\n`
					}
					content += '\n';
				}

				await interaction.update({
					content,
					components: []
				});
				Stock.creatureSaved[trainer.id] = null;
				Stock.trainerSaved[userId] = null;
				break;

			case 'place_choices':
				if (selected[0] == 'withdraw') {
					let embed = {
						type: 'rich',
						title: trainer.name,
						color: 0x530f57,
						fields: []
					}
					let copies = {};
					let association = {};
					let values = {};

					for (const creature of allCreaturesPC) {
						const name = `${creature.nickname ? creature.nickname : specie.name}`;
						const specie = await creature.getSpecie();
						if (!copies[name]) copies[name] = [];
						copies[name].push(creature);
						association[creature.id] = specie;
					}

					for (const creature of allCreaturesPC) {
						const name = `${creature.nickname ? creature.nickname : specie.name}`;
						const specie = association[creature.id];
						let code = `${name}`
						if (copies[name].length > 1) code += `-${creature.id}`;
						let value = `Ecrivez ${code}`;
						embed.fields.push({ name, value });

						values[code] = creature;
					}

					Stock.creatureSaved[trainer.id] = values;
					Stock.trainerSaved[userId][1] = 'withdraw';

					return await interaction.update({
						content: 'Choisissez les pokémons à retirer. (pour retirer plusieurs pokémons, mettez des virgules entre les pokémons)',
						components: [],
						embeds: [embed]
					})
				} else if (selected[0] == 'deposit') {
					let team = [];
					for (const creature of allCreaturesTeam) {
						const specie = await creature.getSpecie();
						team.push({
							label: creature.nickname ? creature.nickname : specie.name,
							description: `${specie.name} niveau ${creature.level}`,
							value: `${creature.id}`
						})
					}

					const choices = new ActionRowBuilder()
									.addComponents(
										new StringSelectMenuBuilder()
											.setCustomId('deposited')
											.setPlaceholder('Qui à déposer ?')
											.setMinValues(1)
											.setMaxValues(team.length - 1)
											.addOptions(team)
									)

					return await interaction.update({
						content: 'Choisissez les pokémons à déposer.',
						components: [choices]
					});
				}
				break;

			case 'deposited':
				for (const creature of allCreaturesTeam) {
					if (selected.includes(`${creature.id}`)) {
						creature.update({ place: 'computer' })
					}
				}

				await interaction.update({
					content: `Pokémons déposés !`,
					components: []
				});
				Stock.creatureSaved[trainer.id] = null;
				Stock.trainerSaved[userId] = null;
				break;
		}
	}
	
});

client.on(Events.MessageCreate, async message => {
	const userId = message.author.id;
	const content = message.content;
	if (userId !== clientId) {
		const [trainer, mode] = Stock.trainerSaved[userId];

		switch (mode) {
			case "withdraw":
				const allQuotes = content.split(',')
				const values = Stock.creatureSaved[trainer.id];
				const allCreatures = Object.keys(values);
				let s = '';

				for (let quote of allQuotes) {
					quote = quote.trim();
					if (allCreatures.includes(quote)) {
						values[quote].update({ place: 'team' });
						s += `${quote} retiré.\n`
					}
					else {
						s += `${quote} n'existe pas.\n`
					}
				}

				await message.reply(s);

				Stock.creatureSaved[trainer.id] = null;
				Stock.trainerSaved[userId] = null;
				break;
		}
	}
});