const {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require('discord.js');
const { Pokemon_Trainer } = require('../classes');
const { Stock } = require('../datas/stock');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get_happiness')
        .setDescription(`Permet de gagner ou perdre des points de bonheur.`)
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
        const trainer = await Pokemon_Trainer.findOne({
            where: {
                name: interaction.options.getString('trainer').trim(),
                userId
            },
            include: [ Pokemon_Trainer.Team ]
        });
        if (!trainer) return [null, `Désolé, mais ${trainerName} n'est pas un Dresseur.`];

        Stock.trainerSaved[userId] = trainer;

        return await interaction.reply({
            content: `Comment avez-vous gagné ou perdu du bonheur ?`,
            components: [
                new ActionRowBuilder()
                        .addComponents(
                            new StringSelectMenuBuilder()
                                .setCustomId('happiness')
                                .setPlaceholder('Quel mode ?')
                                .addOptions([
                                    {
                                        label: `Manger des baies anti-EV`,
                                        description: `+10 / +5 / +1 / +1`,
                                        value: `ev`
                                    },
                                    {
                                        label: `Utiliser des vitamines`,
                                        description: `+4 / +2 / 0 / 0`,
                                        value: `vit`
                                    },
                                    {
                                        label: `Utiliser une plume`,
                                        description: `+2 / +1 / 0 / 0`,
                                        value: `fea`
                                    },
                                    {
                                        label: `Combattre un Champion ou un Maître`,
                                        description: `+5 / +3 / 0 / 0`,
                                        value: `gym`
                                    },
                                    {
                                        label: `Utiliser un objet de boost en combat`,
                                        description: `+1 / +1 / 0 / 0`,
                                        value: `buff`
                                    },
                                    {
                                        label: `Tomber KO contre un adversaire ayant - de 30 niveaux de +`,
                                        description: `-1 / -1 / -1 / -1`,
                                        value: `ko-`
                                    },
                                    {
                                        label: `Tomber KO contre un adversaire ayant + de 30 niveaux de +`,
                                        description: `-5 / -5 / -10 / -10`,
                                        value: `ko+`
                                    },
                                    {
                                        label: `Utiliser une Poudrénergie ou Poudre Soin`,
                                        description: `-5 / -5 / -10 / -10`,
                                        value: `pow`
                                    },
                                    {
                                        label: `Utiliser une Racinénergie`,
                                        description: `-5 / -10 / -15 / -15`,
                                        value: `racn`
                                    },
                                    {
                                        label: `Utiliser une Herbe Rappel`,
                                        description: `-15 / -15 / -20 / -20`,
                                        value: `herb`
                                    }
                                ])
                        )
            ]
        });
    }
}