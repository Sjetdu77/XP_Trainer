const { DataTypes } = require('sequelize');
const { Pokemon_Creature } = require('./class/Pokemon_Creature');
const { Pokemon_Specie } = require('./class/Pokemon_Specie');
const { Pokemon_Trainer } = require('./class/Pokemon_Trainer');
const { dataBaseTable } = require('./class/table_models');
const { Op } = require("sequelize");

const specie_evolution = dataBaseTable.define('specie_evolution', {
    conditions: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, { timestamps: false });

const originForm = dataBaseTable.define('forms', {
    origin: {
        type: DataTypes.STRING,
        primaryKey: true
    }
}, { timestamps: false });

const specie_origin = dataBaseTable.define('specie_origin', {}, { timestamps: false });

Pokemon_Trainer.Team = Pokemon_Trainer.hasMany(Pokemon_Creature, { foreignKey: { allowNull: true, name: 'team' } });
Pokemon_Creature.Trainer = Pokemon_Creature.belongsTo(Pokemon_Trainer, { foreignKey: { allowNull: true, name: 'team' } });
Pokemon_Specie.Creatures = Pokemon_Specie.hasMany(Pokemon_Creature);
Pokemon_Creature.Specie = Pokemon_Creature.belongsTo(Pokemon_Specie);
Pokemon_Specie.Evolution = Pokemon_Specie.belongsToMany(Pokemon_Specie, { as: 'evolutions', through: specie_evolution });

Pokemon_Specie.Origin = Pokemon_Specie.belongsToMany(originForm, { through: specie_origin, as: 'origin' });
originForm.Species = originForm.belongsToMany(Pokemon_Specie, { through: specie_origin });

async function synchronize(restart = false) {
    await Pokemon_Specie.sync();
    await Pokemon_Creature.sync();
    await Pokemon_Trainer.sync();
    await specie_evolution.sync();
    await originForm.sync();
    await specie_origin.sync();

    if (!restart) {
        await Pokemon_Creature.destroy({ where: {
            [Op.or]: [
                { team: null },
                { place: 'wild' }
            ]
        }});
    
        const allTrainers = await Pokemon_Trainer.findAll();
        for (const trainer of allTrainers) {
            const creatures = await trainer.getCreatures();
            if (creatures.length === 0) {
                trainer.destroy();
            }
        }
    }
}

module.exports = { Pokemon_Specie, Pokemon_Trainer, Pokemon_Creature, originForm, synchronize };