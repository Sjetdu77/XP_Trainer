const {
    SlashCommandBuilder,
    ChatInputCommandInteraction
} = require('discord.js');
const { Pokemon_Trainer, Pokemon_Specie, Pokemon_Creature } = require('../classes');
const { Op } = require("sequelize");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rename_pokemon')
        .setDescription(`Permet d'obtenir un starter.`)
        .addStringOption(option => 
            option.setName('trainer')
                .setDescription('Dresseur qui possède le pokémon')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('pokemon')
                .setDescription('Le Pokémon à renommer')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('nickname')
                .setDescription('Surnom du pokémon')
                .setRequired(true)
        ),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const trainer = interaction.options.getString('trainer');
        const pokemon = interaction.options.getString('pokemon');
        const nickname = interaction.options.getString('nickname');

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
            var pokemonFounded = await trainerFounded.getCreatures({ where: { specieId: specieFounded.id } });
            
            if (pokemonFounded.length === 0) {
                return await interaction.reply({
                    content: `Il n'y a pas de pokémon du nom de ${pokemon}.`,
                    ephemeral: true
                });
            }
        }

        if (pokemonFounded.length === 1) {
            await Pokemon_Creature.update({ nickname }, { where: { id: pokemonFounded[0].id } });

            return await interaction.reply({
                content: `Pokémon surnommé`,
                ephemeral: true
            });
        } else if (pokemonFounded.length > 1) await interaction.reply({
            content: 'En travaux',
            ephemeral: true
        });
        else await interaction.reply({
            content: `Il n'existe pas de pokémon du nom de ${pokemon}`,
            ephemeral: true
        })
    }
}