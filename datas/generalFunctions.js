const { ChatInputCommandInteraction } = require('discord.js');
const { Pokemon_Trainer, Pokemon_Creature, Pokemon_Specie } = require('../classes');
const { Op } = require('sequelize');
const { Stock } = require('./stock');

var originToCode = {
    "Alola": 'A',
    "Galar": 'G',
    "Hisui": 'H',
    "Paldea": 'P'
}

/**
 * 
 * @param {string} specieOrigin 
 * @param {boolean} starter 
 * @returns 
 */
async function getSpecie(specieOrigin, starter=false) {
    let [specieName, origin] = specieOrigin.split('/');
    specieName = specieName.trim();

    let where = {
        [Op.or]: [
            { name: specieName },
            { english_name: specieName }
        ]
    };
    if (starter) where.starter = true;
    if (origin) where.id = {
        [Op.endsWith]: `-${originToCode[origin.trim()]}`
    }

    return await Pokemon_Specie.findOne({
        where,
        include: [
            Pokemon_Specie.Creatures,
            Pokemon_Specie.Evolution
        ]
    });
}

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
async function createCreature(interaction, trainer, specieOrigin, level, otherValues={}, starter=false) {
    if (level > 100 || level < 0) return null;
    
    let [specieName, origin] = specieOrigin.split('/');
    specieName = specieName.trim();

    let where = {
        [Op.or]: [
            { name: specieName },
            { english_name: specieName }
        ]
    };
    if (starter) where.starter = true;
    if (origin) where.id = {
        [Op.endsWith]: `-${originToCode[origin.trim()]}`
    }

    const specieFounded = await getSpecie(specieOrigin, starter);
    if (!specieFounded) {
        await interaction.reply({
            content: `Il n'y a pas de Pokémon du nom de ${specie}.`,
            ephemeral: true
        });

        return null;
    }

    let data = {
        ...{
            level,
            actualXP: specieFounded.calculateLvlXP(level - 1),
            specieId: specieFounded.id,
        },
        ...otherValues
    }
    if (trainer) data.team = trainer.id;
    
    return await Pokemon_Creature.create(data);
}

/**
 * 
 * @param {string} userId 
 * @param {string} trainerName 
 * @param {string} place 
 * @returns {Promise<[Pokemon_Trainer | null, string | {
 *      label: string;
 *      description: string;
 *      value: string;
 * }[]]>}
 */
async function setAllOptions(userId, trainerName, place='team') {
    const trainer = await Pokemon_Trainer.findOne({
        where: { name: trainerName, userId },
        include: [ Pokemon_Trainer.Team ]
    });
    if (!trainer) return [null, `Désolé, mais ${trainerName} n'est pas un Dresseur.`];

    const creatures = await trainer.getCreatures({
        where: { place },
        include: [ Pokemon_Creature.Specie ]
    });
    if (creatures.length === 0 && place === 'team')
        return [null, `Désolé, mais ${trainer} n'a pas de pokémon !`];

    let options = [], teamSaved = {};
    for (const creature of creatures) {
        teamSaved[`${creature.id}`] = creature;
        options.push({
            label: await getName(creature),
            description: `${await creature.getSpecieName()} niveau ${creature.level}`,
            value: `${creature.id}`
        })
    }
    Stock.trainerSaved[userId] = trainer;
    Stock.teamSaved[trainer.id] = teamSaved;

    return [trainer, options];
}

/**
 * 
 * @param {Pokemon_Creature} creature 
 * @returns {Promise<string>}
 */
async function getName(creature) {
    const specie = await creature.getSpecie();
    return creature.nickname ? creature.nickname : specie.name;
}

module.exports = {
    createCreature,
    getSpecie,
    setAllOptions,
    getName
}