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
const { Pokemon_Specie, Pokemon_Trainer, Pokemon_Creature, synchronize } = require('./classes.js');
const { Op } = require("sequelize");
const { Stock } = require('./datas/stock');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, async c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
    await synchronize();
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
    //const userId = interaction.user.id;

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
		if (interaction.customId === 'winners') {
			const selected = interaction.values;
			const firstCreature = await Pokemon_Creature.findOne({ where: { id: parseInt(selected[0]) }, includes: [Pokemon_Creature.Trainer] });
			const trainer = await firstCreature.getTrainer({ includes: [Pokemon_Trainer.Team] });
			const allCreaturesWith = await trainer.getCreatures({ where: { place: 'team' } });

			let content = ``;
			for (const creature of allCreaturesWith) {
				const specie = await creature.getSpecie();
				const gains = await creature.gainXPViaFoe(Stock.creatureSaved[trainer.id], selected.includes(`${creature.id}`));
				content += `${creature.nickname ? creature.nickname : specie.name} gagne ${gains[0]} point d'expérience.\n`;
				if (gains[1] > 0) {
					content += `${creature.nickname ? creature.nickname : specie.name} gagne ${gains[1]} niveaux.\n`
				}
				content += '\n';
			}

			await interaction.update({
				content,
				components: []
			});
		}
	}
	
});