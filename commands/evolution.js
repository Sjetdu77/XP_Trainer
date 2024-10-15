const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require('discord.js');
const { Pokemon_Trainer, Pokemon_Creature } = require('../classes');
const { getName } = require('../datas/generalFunctions');
const { Stock } = require('../datas/stock');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('evolute_pokemon')
        .setDescription(`Permet de gagner de l'expérience brut.`)
        .addStringOption(option => 
            option.setName('trainer')
                .setDescription('Dresseur associé')
                .setRequired(true)
        ),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction 
     */
    async execute(interaction) {
        const userId = interaction.user.id;
        const trainerName = interaction.options.getString('trainer').trim();
        const trainer = await Pokemon_Trainer.findOne({
            where: { name: trainerName, userId }
        });
        if (!trainer)
            return await interaction.reply({
                content: `Désolé, mais ${trainerName} n'est pas un Dresseur.`,
                ephemeral: true
            });

        const creatures = await trainer.getCreatures({
            where: { place: 'team' },
            include: [ Pokemon_Creature.Specie ]
        });

        let options = [], teamSaved = {};
        for (const creature of creatures)
            if (await creature.canEvolute()) {
                teamSaved[`${creature.id}`] = creature;
                options.push({
                    label: await getName(creature),
                    description: `${await creature.getSpecieName()} niveau ${creature.level}`,
                    value: `${creature.id}`
                })
            }

        Stock.trainerSaved[userId] = trainer;
        Stock.teamSaved[trainer.id] = teamSaved;

        if (options.length === 0) return await interaction.reply({
            content: `Désolé, mais aucun pokémon ne peut évoluer.`,
            ephemeral: true
        });
        else return await interaction.reply({
            content: `Quel pokémon a le droit d'évoluer`,
            components: [
                new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId('evolute')
                                .setPlaceholder('Qui à évoluer ?')
                                .addOptions(options)
                        )
            ]
        });   
    }
}