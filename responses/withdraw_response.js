const {
    StringSelectMenuInteraction
} = require('discord.js');
const { Stocks } = require('../datas/stock');
const { Pokemon_Creature } = require('../classes');
const { getName } = require('../datas/generalFunctions');

/**
 * 
 * @param {StringSelectMenuInteraction} interaction 
 * @returns 
 */
async function withdraw_response(interaction) {
    const userId = interaction.user.id;
    const stock = Stocks.getStock(userId);
    const trainer = stock.chosenTrainer;
    const allCreaturesPC = await trainer.getCreatures({
        where: { place: 'computer' },
        include: [ Pokemon_Creature.Specie ]
    });

    let embed = {
        type: 'rich',
        title: trainer.name,
        color: 0x530f57,
        fields: []
    }
    let copies = {};
    let association = {};
    let values = {};

    for (const creature of allCreaturesPC) {
        const specie = await creature.getSpecie();
        const name = await getName(creature);
        if (!copies[name]) copies[name] = [];
        copies[name].push(creature);
        association[creature.id] = specie;
    }

    for (const creature of allCreaturesPC) {
        const specie = association[creature.id];
        const name = `${creature.nickname ? creature.nickname : specie.name}`;
        let code = `${name}`
        if (copies[name].length > 1) code += `-${creature.id}`;
        let value = `Ecrivez ${code}`;
        embed.fields.push({ name, value });

        values[code] = creature;
    }

    stock.creature = values;
    stock.mode = 'withdraw';

    await interaction.update({
        content: 'Choisissez les pokémons à retirer. (pour retirer plusieurs pokémons, mettez des virgules entre les pokémons)',
        components: [],
        embeds: [embed]
    })
}

module.exports = withdraw_response;