const { ChatInputCommandInteraction } = require('discord.js');
const { Pokemon_Trainer, Pokemon_Specie, Pokemon_Creature } = require('../classes');
const { Op } = require("sequelize");

let regions = [
    'Kanto',
    'Johto',
    'Hoenn',
    'Sinnoh',
    'Unys',
    'Kalos',
    'Alola',
    'Galar',
    'Hisui',
    'Paldea'
]

/**
 * 
 * @param {ChatInputCommandInteraction} interaction 
 * @param {Pokemon_Trainer} trainer 
 * @param {string} specieOrigin 
 * @param {number} level 
 * @param {object} otherValues 
 * @param {boolean} starterNeeded 
 * @returns 
 */
async function createCreature(interaction, trainer, specieOrigin, level, otherValues={}, starterNeeded=false) {
    let [ specie, origin ] = specieOrigin.split('/');
    specie = specie.trim();

    let where = {
        [Op.or]: [
            { english_name: specie },
            { name: specie }
        ],
    };
    if (starterNeeded) {
        where.starter = true;
    }

    const specieFounded = await Pokemon_Specie.findOne({ where });
    if (!specieFounded) {
        await interaction.reply({
            content: `Il n'y a pas de Pokémon du nom de ${specie}.`,
            ephemeral: true
        });

        return null;
    }

    if (origin) {
        origin = origin.trim();
    }

    if (!(origin && regions.includes(origin))) {
        let intId = parseInt(specieFounded.id);

        if (intId <= 151) {
            origin = 'Kanto';
        } else if (intId <= 251) {
            origin = 'Johto';
        } else if (intId <= 386) {
            origin = 'Hoenn';
        } else if (intId <= 493) {
            origin = 'Sinnoh';
        } else if (intId <= 649) {
            origin = 'Unys';
        } else if (intId <= 721) {
            origin = 'Kalos';
        } else if (intId <= 809) {
            origin = 'Alola';
        } else if (intId <= 898) {
            origin = 'Galar';
        } else if (intId <= 905) {
            origin = 'Hisui';
        } else {
            origin = 'Paldea'
        }
    }

    let data = {
        ...{
            level,
            specieId: specieFounded.id,
            origin: origin
        },
        ...otherValues
    }
    if (trainer) {
        data.team = trainer.id;
    }
    
    return await Pokemon_Creature.create(data);
}

module.exports = {
    createCreature
}