const {
    SlashCommandBuilder,
    ChatInputCommandInteraction
} = require('discord.js');
const { Pokemon_Trainer } = require('../classes');
const { createCreature } = require('../datas/generalFunctions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('new_trainer')
        .setDescription('Crée un nouveau Dresseur')
        .addStringOption(option => 
            option.setName('trainer_name')
                .setDescription('Nom du Dresseur')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('starter')
                .setDescription('Espèce du starter du Dresseur')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('nickname')
                .setDescription('Surnom du starter')
        ),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     * @returns {void}
     */
    async execute(interaction) {
        const name = interaction.options.getString('trainer_name').trim();
        const starter = interaction.options.getString('starter');
        let nickname = interaction.options.getString('nickname');
        if (nickname) nickname = nickname.trim();

        let [pokename, region] = starter.split('/');
        pokename = pokename.trim();
        if (region) region = region.trim();
        
        let userId = interaction.user.id;
        let firstData = { name, userId };
        if (await Pokemon_Trainer.findOne({where: firstData})) {
            await interaction.reply({
                content: `Désolé, mais tu existes déjà, ${name}.`,
                ephemeral: true
            });
        } else {
            const newTrainer = await Pokemon_Trainer.create(firstData);
            const returned = await createCreature(interaction, newTrainer, starter, 5, {place: 'team', nickname}, true);
            if (returned) return await interaction.reply(`Bonjour, ${name}.\nBienvenue dans le Monde Pokémon`);
            else return await interaction.reply({
                content: `Désolé, le pokémon n'existe pas.`,
                ephemeral: true
            });
        }
    },
};