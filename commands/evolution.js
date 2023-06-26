const {
    SlashCommandBuilder,
    ChatInputCommandInteraction
} = require('discord.js');
const { Pokemon_Trainer, Pokemon_Specie, Pokemon_Creature } = require('../classes');
const { Op } = require("sequelize");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('evolute_pokemon')
        .setDescription(`Permet de gagner de l'expérience brut.`)
        .addStringOption(option => 
            option.setName('trainer')
                .setDescription('Dresseur qui possède le pokémon')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('pokemon')
                .setDescription('Le pokémon en question')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('evolution')
                .setDescription(`L'évolution à prendre`)
                .setRequired(true)
        ),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const trainer = interaction.options.getString('trainer');
        const pokemon = interaction.options.getString('pokemon');
        const evolution = interaction.options.getString('evolution');

        const username = `${interaction.user.username}#${interaction.user.discriminator}`;
        const trainerFounded = await Pokemon_Trainer.findOne({ where: {
            name: trainer,
            username
        } });

        if (!trainerFounded) {
            return await interaction.reply({
                content: `${trainer} n'est pas un Dresseur.`,
                ephemeral: true
            });
        }

        var pokemonFounded = await trainerFounded.getCreatures({ where: { nickname: pokemon } });

        if (pokemonFounded.length === 0) {
            const specieFounded = await Pokemon_Specie.findOne({
                where: {
                    [Op.or]: [
                        { name: pokemon },
                        { english_name: pokemon }
                    ]
                }
            });
            pokemonFounded = await Pokemon_Creature.findAll({
                where: {
                    specieId: specieFounded.id,
                    team: trainerFounded.id
                }
            });

            if (!pokemonFounded) {
                return await interaction.reply({
                    content: `Il n'y a pas de pokémon du nom de ${pokemon}.`,
                    ephemeral: true
                });
            }
        }

        if (pokemonFounded.length === 1) {
            const thePokemonFounded = pokemonFounded[0];
            
            const specieFounded = await thePokemonFounded.getSpecie({ include: [Pokemon_Specie.Evolution] });
            let evolutionFounded = await specieFounded.getEvolutions({ where: { name: evolution } });
            evolutionFounded = evolutionFounded[0];

            if (evolutionFounded) {
                await thePokemonFounded.setSpecie(evolutionFounded);
                await interaction.reply({
                    content: `Hiro évolue en ${evolutionFounded.name} !`
                });
            } else await interaction.reply({
                content: `Il n'existe pas de pokémon du nom de ${evolution}`,
                ephemeral: true
            })

            
        } else await interaction.reply({
            content: 'En travaux',
            ephemeral: true
        });
    }
}