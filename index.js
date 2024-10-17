const fs = require('node:fs');
const path = require('node:path');
const {
	Client,
	Events,
	Collection,
	GatewayIntentBits,
} = require('discord.js');
const {
	winners_response,
	withdrawed_response,
	withdraw_response,
	deposit_response,
	deposited_response,
	correction_response,
	level_response,
	experience_response,
	rename_choice_response,
	rename_type_response,
	evolute_response,
	evolution_response,
	happiness_response,
	set_happiness_response,
	exchange_solo_response,
	return_exchange_response,
	leave_response
} = require('./responses.js');
const { token } = require('./config.json');
const { synchronize, Pokemon_Creature } = require('./classes.js');
const { Stocks } = require('./datas/stock.js');
const trainer_response = require('./responses/trainer_response.js');

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
    if (interaction.isChatInputCommand()) {
		const command = interaction.client.commands.get(interaction.commandName);
		if (!command) return console.error(`No command matching ${interaction.commandName} was found.`);

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	} else if (interaction.isStringSelectMenu()) {
		switch (interaction.customId) {
			case 'trainer':			return await trainer_response(interaction);
			case 'winners': 		return await winners_response(interaction);
			case 'deposited': 		return await deposited_response(interaction);
			case 'correction': 		return await correction_response(interaction);
			case 'levels': 			return await level_response(interaction);
			case 'experience': 		return await experience_response(interaction);
			case 'rename_choice': 	return await rename_choice_response(interaction);
			case 'evolute': 		return await evolute_response(interaction);
			case 'evolution': 		return await evolution_response(interaction);
			case 'happiness': 		return await happiness_response(interaction);
			case 'set_happiness':	return await set_happiness_response(interaction);
			case 'exchange_solo':	return await exchange_solo_response(interaction);
			case 'return_exchange':	return await return_exchange_response(interaction);
			case 'leave':			return await leave_response(interaction);
			case 'place_choices':
				if (interaction.values[0] == 'withdraw') 		await withdraw_response(interaction);
				else if (interaction.values[0] == 'deposit') 	await deposit_response(interaction);
				break;
		}
	}
});

client.on(Events.MessageCreate, async message => {
	const userId = message.author.id;
	const stock = Stocks.getStock(userId);
	if (stock.notEmpty() && userId !== clientId) {
		switch (stock.mode) {
			case "withdraw": await withdrawed_response(message);
			case "rename": await rename_type_response(message);
		}

		stock.clear();
	}
});