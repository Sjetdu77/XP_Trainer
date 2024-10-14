const {
    SlashCommandBuilder,
    ChatInputCommandInteraction
} = require('discord.js');
const { Pokemon_Trainer } = require('../classes');
const { createCreature } = require('../datas/generalFunctions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get_new_pokemon')
        .setDescription(`Permet d'obtenir un nouveau pokémon.`)
        .addStringOption(option => 
            option.setName('trainer')
                .setDescription('Dresseur associé')
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
        const trainer = interaction.options.getString('trainer').trim();
        const specie = interaction.options.getString('specie').trim();
        const level = interaction.options.getInteger('level');
        let nickname = interaction.options.getString('nickname');
        if (nickname) nickname = nickname.trim();

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

        if (returned)
            return await interaction.reply({
                content: `Félicitations pour votre nouveau pokémon, ${trainer} !`
            });
        else
            return await interaction.reply({
                content: `Désolé, le pokémon n'existe pas.`,
                ephemeral: true
            });
    }
}