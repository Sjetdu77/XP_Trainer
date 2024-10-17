const {
    ChatInputCommandInteraction
} = require("discord.js");
const { Stocks } = require('../datas/stock');
const { createCreature } = require('../datas/generalFunctions');

/**
 * 
 * @param {ChatInputCommandInteraction} interaction 
 * @returns 
 */
async function get_new_pokemon(interaction) {
    const userId = interaction.user.id;
    const stock = Stocks.getStock(userId);
    const trainer = stock.chosenTrainer;
    const datas = stock.datas;
    const creatures = await trainer.getCreatures({ where: { place: 'team' } });

    const returned = await createCreature(
        interaction, trainer, datas.specie, datas.level,
        {
            nickname: datas.nickname,
            place: creatures.length < 6 ? 'team' : 'computer',
            captured: trainer.id
        }
    );

    if (returned) return await interaction.update({
        content: `Félicitations pour votre nouveau pokémon, ${trainer.name} !`,
        components: []
    });
    else return await interaction.reply({
        content: `Désolé, le pokémon n'existe pas.`,
        ephemeral: true
    });
}

module.exports = get_new_pokemon;