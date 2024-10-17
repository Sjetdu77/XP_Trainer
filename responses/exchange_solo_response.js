const {
    StringSelectMenuInteraction
} = require('discord.js');
const { Stocks } = require('../datas/stock');
const { getName, createCreature } = require('../datas/generalFunctions');

/**
 * 
 * @param {StringSelectMenuInteraction} interaction 
 * @returns 
 */
async function exchange_solo_response(interaction) {
    const userId = interaction.user.id;
    const stock = Stocks.getStock(userId);
    const creatureData = stock.datas;
    const creature = stock.team[interaction.values[0]];
    
    const returned = await createCreature(
        interaction,
        stock.chosenTrainer,
        creatureData.pokemon,
        creatureData.level ? creatureData.level : creature.level,
        {
            nickname: creatureData.nickname,
            place: 'team',
            exchanged: true
        }
    );

    if (!returned) return await interaction.reply({
        content: `Désolé, le pokémon à échanger n'existe pas.`,
        ephemeral: true
    });

    const name = await getName(creature), nameNew = await getName(returned);
    await creature.update({ place: 'exchanged' });

    await interaction.update({
        content: `${name} est parti. Au revoir, ${name} !\n${nameNew} est désormais dans l'équipe. Bienvenue ${nameNew} !`,
        components: []
    });

    stock.clear();
}

module.exports = exchange_solo_response;