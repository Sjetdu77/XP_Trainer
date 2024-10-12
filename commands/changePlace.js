const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require('discord.js');
const { Pokemon_Trainer, Pokemon_Creature, Pokemon_Specie } = require('../classes');
const { Op } = require("sequelize");
const { Stock } = require('../datas/stock');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('change_place')
        .setDescription(`Permet à un pokémon de changer de place entre l'équipe et le PC.`)
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
        const trainer = interaction.options.getString('trainer');

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

        Stock.trainerSaved[userId] = [trainerFounded, ''];

        let options = [];
        const creaturesTeam = await trainerFounded.getCreatures({ where: { place: 'team' }, include: [ Pokemon_Creature.Specie ] });
        if (creaturesTeam.length === 0) {
            return await interaction.reply({
                content: `Mais ${trainer} n'a pas de pokémon dans son équipe !`,
                ephemeral: true
            });
        }

        const creaturesPC = await trainerFounded.getCreatures({ where: { place: 'computer' }, include: [ Pokemon_Creature.Specie ] });
        
        if (creaturesTeam.length < 6 && creaturesPC.length > 0) {
            options.push({
                label: `Retirer`,
                description: `Intégrer dans l'équipe des pokémons pris des boîtes.`,
                value: `withdraw`
            })
        }
        if (creaturesTeam.length > 1) {
            options.push({
                label: `Déposer`,
                description: `Déposer des pokémons de l'équipe dans des boîtes.`,
                value: `deposit`
            })
        }

        const choices = new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId('place_choices')
                                .setPlaceholder(`Retirer ou déposer ?`)
                                .addOptions(options)
                        )

        return await interaction.reply({
            content: `Qu'est-ce que vous voulez faire ?`,
            components: [choices]
        })
    }
}