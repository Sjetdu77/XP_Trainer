const {
    SlashCommandBuilder,
    ChatInputCommandInteraction
} = require('discord.js');
const { Pokemon_Trainer, Pokemon_Creature, Pokemon_Specie } = require('../classes');
const { Op } = require("sequelize");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('change_place')
        .setDescription(`Un pokémon a été vaincu.`)
        .addStringOption(option => 
            option.setName('trainer')
                .setDescription('Dresseur qui a vaincu le pokémon')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('first_pokémon')
                .setDescription('Premier pokémon à changer de place')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('second_pokémon')
                .setDescription('Deuxième pokémon à changer de place')
                .setRequired(true)
        ),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const trainer = interaction.options.getString('trainer');
        const first = interaction.options.getString('first_pokémon');
        const second = interaction.options.getString('second_pokémon');

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

        const first_specie = await Pokemon_Specie.findOne({
            where: {
                [Op.or]: [
                    { name: first },
                    { english_name: first }
                ]
            }
        });
        let first_creature = await trainerFounded.getCreatures({ where: {
            [Op.or]: [
                { nickname: first },
                { specieId: first_specie.id }
            ]
        }, include: [ Pokemon_Creature.Specie ] });
        if (first_creature.length === 0) {
            return await interaction.reply({
                content: `Mais ${trainer} n'a pas de ${first} !`,
                ephemeral: true
            });
        }

        const second_specie = await Pokemon_Specie.findOne({
            where: {
                [Op.or]: [
                    { name: second },
                    { english_name: second }
                ]
            }
        });
        let second_creature = await trainerFounded.getCreatures({ where: {
            [Op.or]: [
                { nickname: second },
                { specieId: second_specie.id }
            ]
        }, include: [ Pokemon_Creature.Specie ] });
        if (second_creature.length === 0) {
            return await interaction.reply({
                content: `Mais ${trainer} n'a pas de ${second} !`,
                ephemeral: true
            });
        }

        first_creature = first_creature[0];
        second_creature = second_creature[0];

        if (first_creature.place === second_creature.place) {
            return await interaction.reply({
                content: `Les deux pokémons sont dans la même place.`
            });
        }

        let s = first_creature.place;
        first_creature.update({ place: second_creature.place })
        second_creature.update({ place: s });

        return await interaction.reply({
            content: `Les pokémons ont changé de place.`
        });
    }
}