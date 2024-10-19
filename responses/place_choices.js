const {
    StringSelectMenuInteraction
} = require('discord.js');
const withdraw = require('./withdraw');
const deposit = require('./deposit');

/**
 * 
 * @param {StringSelectMenuInteraction} interaction 
 * @returns 
 */
async function place_choices(interaction) {
    switch (interaction.values[0]) {
        case 'withdraw': return await withdraw(interaction);
        case 'deposit': return await deposit(interaction);
        default: return;
    }
}

module.exports = place_choices;