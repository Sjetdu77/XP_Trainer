const {
    ChatInputCommandInteraction,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require("discord.js");

/**
 * 
 * @param {ChatInputCommandInteraction} interaction 
 * @returns 
 */
const get_happiness = async interaction => await interaction.update({
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

module.exports = get_happiness;