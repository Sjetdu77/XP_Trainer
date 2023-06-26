const {
    SlashCommandBuilder,
    ChatInputCommandInteraction
} = require('discord.js');
const { Pokemon_Trainer, Pokemon_Specie, Pokemon_Creature } = require('../classes');
const { Op } = require("sequelize");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get_exp')
        .setDescription(`Permet de gagner de l'expérience brut.`)
        .addStringOption(option => 
            option.setName('trainer')
                .setDescription('Dresseur qui possède le pokémon')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('pokemon')
                .setDescription('Le Pokémon en question')
                .setRequired(true)
        )
        .addIntegerOption(option => 
            option.setName('xp')
                .setDescription(`Points d'expérience gagnés`)
                .setRequired(true)
        ),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const trainer = interaction.options.getString('trainer');
        const pokemon = interaction.options.getString('pokemon');
        const experience = interaction.options.getInteger('xp');

        const username = `${interaction.user.username}#${interaction.user.discriminator}`;
        const trainerFounded = await Pokemon_Trainer.findOne({
            where: {
                name: trainer,
                username
            }
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
            const lvlUp = await thePokemonFounded.gainXP(experience);
            var string = `${pokemon} gagne ${experience} points d'expérience.`;
            if (lvlUp > 0) {
                string += `\n${pokemon} gagne ${lvlUp} niveaux.`
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