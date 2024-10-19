const fs = require('node:fs');
const path = require('node:path');
const { Client, Events, Collection, GatewayIntentBits, } = require('discord.js');
const responses = require('./responses.js');
const { token } = require('./config.json');
const { synchronize, Pokemon_Creature } = require('./classes.js');
const { Stocks } = require('./datas/stock.js');

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
	} else if (interaction.isStringSelectMenu()
		&& Stocks.getStock(interaction.user.id).notEmpty()) return await responses[interaction.customId](interaction);
});

client.on(Events.MessageCreate, async message => {
	const userId = message.author.id;
	const stock = Stocks.getStock(userId);
	if (stock.notEmpty() && userId !== clientId) {
		await responses[stock.mode](message);
		stock.clear();
	}
});