const {
    ChatInputCommandInteraction
} = require('discord.js');
const { createCreature, setMenuBuilder } = require("../datas/generalFunctions");
const { Stocks } = require("../datas/stock");

/**
 * 
 * @param {ChatInputCommandInteraction} interaction 
 * @returns 
 */
async function creature_beatted(interaction) {
    const userId = interaction.user.id;
    const stock = Stocks.getStock(userId);
    const datas = stock.datas;
    const component = await setMenuBuilder(
        userId, stock.chosenTrainer,
        'winners', 'Pas de vainqueur ?', false
    )
    if (typeof component === 'string') return await interaction.reply({
        content: component,
        ephemeral: true
    });

    const returned = await createCreature(interaction, null, datas.foe, datas.level);
    if (!returned) return await interaction.reply({
        content: `Désolé, le pokémon n'existe pas.`,
        ephemeral: true
    });

    stock.creature = returned;
    return await interaction.update({
        content: `Un ${await returned.getSpecieName()} a été vaincu. Qui l'a battu ?`,
        components: [ component ]
    });
}

module.exports = creature_beatted;