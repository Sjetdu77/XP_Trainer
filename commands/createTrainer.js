const {
    SlashCommandBuilder,
    ChatInputCommandInteraction
} = require('discord.js');
const { Pokemon_Trainer, Pokemon_Specie } = require('../classes');
const { createCreature } = require('../datas/generalFunctions');
const { Op } = require("sequelize");

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
        const name = interaction.options.getString('trainer_name');
        const starter = interaction.options.getString('starter');
        const nickname = interaction.options.getString('nickname');

        const pokemonFounded = await Pokemon_Specie.findOne({
            where: {
                starter: true,
                [Op.or]: [
                    { name: starter.split('/')[0] },
                    { english_name: starter.split('/')[0] }
                ]
            }
        });
        
        let username = `${interaction.user.username}#${interaction.user.discriminator}`;
        let firstData = {
            name: name,
            username: username
        };
        if (!await Pokemon_Trainer.findOne({where: firstData})) {
            if (!pokemonFounded) {
                return await interaction.reply({
                    content: `Désolé, mais il n'existe aucun pokémon du nom de ${starter.split('/')[0]}.`,
                    ephemeral: true
                });
            }

            const newTrainer = await Pokemon_Trainer.create(firstData);
            const returned = await createCreature(interaction, newTrainer, starter, 5, {place: 'team', nickname}, true);
            if (returned) {
                await interaction.reply({
                    content: `Bonjour, ${name}.\nBienvenue dans le Monde Pokémon`,
                    ephemeral: true
                });
            }
        } else {
            await interaction.reply({
                content: `Désolé, mais tu existes déjà, ${name}.`,
                ephemeral: true
            });
        }
    },
};