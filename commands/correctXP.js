const {
    SlashCommandBuilder,
    ChatInputCommandInteraction
} = require('discord.js');
const { Pokemon_Trainer, Pokemon_Specie, Pokemon_Creature } = require('../classes');
const { createCreature } = require('../datas/generalFunctions');
const { Op } = require("sequelize");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('correct_exp')
        .setDescription(`Permet de retirer l'expérience gagné par erreur.`)
        .addStringOption(option => 
            option.setName('trainer')
                .setDescription('Dresseur associé')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('pokemon')
                .setDescription('Le Pokémon en question')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('foe')
                .setDescription('Le Pokémon adverse battu')
                .setRequired(true)
        )
        .addIntegerOption(option => 
            option.setName('level')
                .setDescription(`Niveau du Pokémon adverse`)
                .setRequired(true)
        ),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const trainer = interaction.options.getString('trainer');
        const pokemon = interaction.options.getString('pokemon');
        const foe = interaction.options.getString('foe');
        const level = interaction.options.getInteger('level');

        const returned = await createCreature(interaction, null, foe, level);

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
            const loses = await thePokemonFounded.minusXPViaFoe(returned);
            const lvlLost = loses[1];
            var string = `${pokemon} perd ${loses[0]} points d'expérience.`;
            if (lvlLost > 0) {
                string += `\n${pokemon} perd ${lvlLost} niveau${lvlLost > 1 ? 'x' : ''}.`
            }

            return await interaction.reply({
                content: string,
                ephemeral: true
            });
        } else if (pokemonFounded.length === 0) {
            await interaction.reply({
                content: `Désolé, mais ${trainer} n'a pas de ${pokemon}`,
                ephemeral: true
            });
        } else await interaction.reply({
            content: 'En travaux',
            ephemeral: true
        });
    }
}