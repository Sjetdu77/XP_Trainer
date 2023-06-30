const {
    SlashCommandBuilder,
    ChatInputCommandInteraction
} = require('discord.js');
const { Pokemon_Trainer } = require('../classes');
const { createCreature } = require('../datas/generalFunctions');
const { Op } = require("sequelize");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get_new_pokemon')
        .setDescription(`Permet d'obtenir un pokémon au début de la partie.`)
        .addStringOption(option => 
            option.setName('trainer')
                .setDescription('Dresseur qui obtient le pokémon')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('specie')
                .setDescription('Espèce du pokémon')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('level')
                .setDescription('Niveau du pokémon')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('nickname')
                .setDescription(`Surnom du pokémon`)
        ),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const trainer = interaction.options.getString('trainer');
        const specie = interaction.options.getString('specie');
        const level = interaction.options.getInteger('level');
        const nickname = interaction.options.getString('nickname');

        const userId = interaction.user.id;
        const trainerFounded = await Pokemon_Trainer.findOne({
            where: { name: trainer, userId },
            include: [ Pokemon_Trainer.Team ]
        });
        if (!trainerFounded) {
            return await interaction.reply({
                content: `${trainer} n'est pas un Dresseur.`,
                ephemeral: true
            });
        }

        const creatures = await trainerFounded.getCreatures();
        if (creatures.length === 0) {
            return await interaction.reply({
                content: `Mais ${trainer} n'a pas de pokémon !`,
                ephemeral: true
            });
        }

        const numCreatures = await trainerFounded.getCreatures({ where: { place: 'team' } });
        const returned = await createCreature(interaction, trainerFounded, specie, level, {
            nickname, place: numCreatures.length < 6 ? 'team' : 'computer'
        });

        if (returned) {
            return await interaction.reply({
                content: `Félicitations pour votre nouveau pokémon, ${trainer} !`,
                ephemeral: true
            });
        }
    }
}