const { ChatInputCommandInteraction, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { Pokemon_Trainer, Pokemon_Creature, Pokemon_Specie } = require('../classes');
const { Op } = require('sequelize');
const { Stocks } = require('./stock');

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
    if (level > 100 || level < 0) {
        await interaction.reply({
            content: `Le niveau est impossible.`,
            ephemeral: true
        });

        return null;
    }
    
    let [specie, origin] = specieOrigin.split('/');
    specie = specie.trim();

    let where = {
        [Op.or]: [
            { name: specie },
            { english_name: specie }
        ]
    };
    if (starter) where.starter = true;
    if (origin) where.id = {
        [Op.endsWith]: `-${originToCode[origin.trim()]}`
    }

    const specieFounded = await getSpecie(specie, starter);
    if (!specieFounded) {
        await interaction.reply({
            content: `Il n'y a pas de starter du nom de ${specie}.`,
            ephemeral: true
        });

        return null;
    }

    let data = {
        ...{
            level,
            actualXP: specieFounded.calculateLvlXP(level - 1),
            specieId: specieFounded.id,
            happiness: level === 1 ? 100 : otherValues.friendBall ? 150 : 50,
            team: trainer ? trainer.id : null,
        },
        ...otherValues
    }
    
    return await Pokemon_Creature.create(data);
}

/**
 * 
 * @param {string} userId 
 * @param {Pokemon_Trainer} trainer 
 * @param {string} place 
 * @returns {Promise<string | {
 *      label: string;
 *      description: string;
 *      value: string;
 * }[]>}
 */
async function setAllOptions(userId, trainer, place='team') {
    const stock = Stocks.getStock(userId);
    if (!trainer) return `Désolé, mais ce Dresseur n'existe pas.`;

    const creatures = await trainer.getCreatures({
        where: { place },
        include: [ Pokemon_Creature.Specie ]
    });

    let options = [], teamSaved = {};
    for (const creature of creatures) {
        teamSaved[`${creature.id}`] = creature;
        options.push({
            label: await getName(creature),
            description: `${await creature.getSpecieName()} niveau ${creature.level}`,
            value: `${creature.id}`
        });
    }
    stock.team = teamSaved;

    if (options.length === 0 && place === 'team') return `Désolé, mais ${trainer.name} n'a pas de pokémon !`;

    return options;
}

/**
 * 
 * @param {string} userId 
 * @param {Pokemon_Trainer} trainer 
 * @param {string} customId 
 * @param {string} placeholder 
 * @param {boolean} unique 
 * @param {boolean} gap 
 * @returns {Promise<ActionRowBuilder | string>}
 */
async function setMenuBuilder(userId, trainer, customId, placeholder, unique=true, gap=false, place='team') {
    const options = await setAllOptions(userId, trainer, place);
    if (typeof options === 'string') return options;
    if (gap && options.length === 1) return `${trainer.name} n'a qu'un seul pokémon.`;
    let stringMenu = new StringSelectMenuBuilder()
                        .setCustomId(customId)
                        .setPlaceholder(placeholder)
                        .setOptions(options);

    if (!unique) stringMenu = stringMenu.setMaxValues(options.length - (gap ? 1 : 0));

    return new ActionRowBuilder().addComponents(stringMenu);
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

/**
 * 
 * @param {string} userId 
 * @param {string} mode 
 * @returns {Promise<{
 *  content: string,
 *  components: ActionRowBuilder | null,
 *  ephemeral: boolean | null
 * }>}
 */
async function getTrainers(userId, mode) {
    const stock = Stocks.getStock(userId);
    const trainers = await Pokemon_Trainer.findAll({ where: { userId }, include: [
        Pokemon_Trainer.Team,
        Pokemon_Trainer.Captured
    ] });
    if (trainers.length === 0) return {
        content: `Désolé, mais vous n'avez pas de Dresseur. Veuillez utiliser /create_trainer.`,
        ephemeral: true
    }

    let options = [], trainersSaved = {};
    for (const trainer of trainers) {
        const creaturesLength = (await trainer.getCreatures({ where: {
            [Op.or]: [
                { place: 'team' },
                { place: 'computer' }
            ]
        } })).length;
        trainersSaved[`${trainer.id}`] = trainer;
        options.push({
            label: trainer.name,
            description: `${creaturesLength} pokémon${creaturesLength > 1 ? 's' : ''}`,
            value: `${trainer.id}`
        });
    }
    stock.trainers = trainersSaved;
    stock.mode = mode;

    return {
        content: `Quel Dresseur est concerné ?`,
        components: [
            new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('trainer')
                        .setPlaceholder(`Quel Dresseur ?`)
                        .setOptions(options)
                )
        ]
    }
}

module.exports = {
    createCreature,
    getSpecie,
    setAllOptions,
    getName,
    setMenuBuilder,
    getTrainers
}