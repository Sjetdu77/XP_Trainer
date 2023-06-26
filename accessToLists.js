const needle = require('needle');
const { JSDOM } = require('jsdom');
const { Pokemon_Specie, originForm, synchronize } = require('./classes')

const origins = [
  'Kanto',
  'Johto',
  'Hoenn',
  'Sinnoh',
  'Unova',
  'Kalos',
  'Alola',
  'Galar',
  'Paldea'
];

const accentsMap = new Map([
  ["A", "Á|À|Ã|Â|Ä"],
  ["E", "É|È|Ê|Ë"],
  ["I", "Í|Ì|Î|Ï"],
  ["O", "Ó|Ò|Ô|Õ|Ö"],
  ["U", "Ú|Ù|Û|Ü"],
  ["C", "Ç"],
  ["N", "Ñ"]
]);

const reducer = (acc, [key]) => acc.replace(new RegExp(accentsMap.get(key), "g"), key);
const removeAccents = (text) => [...accentsMap].reduce(reducer, text);

/**
 * 
 * @param {string} childText 
 */
function removeOrigins(childText) {
  var withoutKanto = childText.split(' (Kantonian')[0];
  var withoutJohto = withoutKanto.split(' (Johtonian')[0];
  var withoutHoenn = withoutJohto.split(' (Hoennian')[0];
  var withoutUnova = withoutHoenn.split(' (Unovan')[0];
  var withoutKalos = withoutUnova.split(' (Kalosian')[0];
  var withoutAlola = withoutKalos.split(' (Alolan')[0];

  return withoutAlola;
}

function removeAllOrigins(childText) {
  var withoutAlola = removeOrigins(childText);
  return withoutAlola.split(' (Hisuian')[0];
}

/**
 * 
 * @param {string} childText 
 */
function getCondition(childText) {
  var [realText, conditionText] = childText.split(' (');

  if (conditionText) {
    conditionText = conditionText.split(')')[0].split('an')[0];

    if (conditionText === 'Galari') {
      conditionText = 'Galar';
    } else if (conditionText === 'White Stripe') {
      conditionText = 'Hisui';
    } else if (conditionText === 'Palde') {
      conditionText = 'Paldea';
    }
  }
  return [realText, conditionText];
}

function getPokemonList() {
  needle.get(`https://bulbapedia.bulbagarden.net/wiki/List_of_French_Pok%C3%A9mon_names`, async (err, res) => {
    if (!err && res.statusCode === 200) {
      for (const origin of origins) {
        await originForm.create({ origin });
      }
      const dom = new JSDOM(res.body, {
        contentType: 'text/html',
        includeNodeLocations: true,
      });
      const document = dom.window.document;
      const allTables = document.querySelectorAll('table.roundy');
      for (const table of allTables) {
        const allTR = table.querySelectorAll('tr[style]');
        for (const tr of allTR) {
          const id = tr.children[0].textContent.trim();
          const english_name = tr.children[2].textContent.trim();

          if (id != '' && tr.children[3]) {
            const name = removeAccents(tr.children[3].textContent.trim());
            await Pokemon_Specie.create({ id, english_name, name });
          }
        }
      }
    }
  })
}

function getBaseXP() {
  needle.get(`https://bulbapedia.bulbagarden.net/wiki/List_of_Pok%C3%A9mon_by_effort_value_yield`, async (err, res) => {
    if (!err && res.statusCode === 200) {
      const dom = new JSDOM(res.body, {
        contentType: 'text/html',
        includeNodeLocations: true,
      });
      const document = dom.window.document;
      const allSpecies = await Pokemon_Specie.findAll({ where: {} });
      for (const specie of allSpecies) {
        const specieCase = document.querySelector(`table [title="${specie.english_name} (Pokémon)"]`);

        if (specieCase) {
          var baseXP = specieCase.parentElement.parentElement.children[3].textContent.trim();
          await Pokemon_Specie.update({ baseXP: parseInt(baseXP) }, { where: { id: specie.id }});
        }
      }
    }
  })
}

function curbXP() {
  needle.get(`https://bulbapedia.bulbagarden.net/wiki/List_of_Pok%C3%A9mon_by_experience_type`, async (err, res) => {
    if (!err && res.statusCode === 200) {
      const dom = new JSDOM(res.body, {
        contentType: 'text/html',
        includeNodeLocations: true,
      });
      const document = dom.window.document;
      const allSpecies = await Pokemon_Specie.findAll({ where: {} });
      for (const specie of allSpecies) {
        const specieCase = document.querySelector(`table [title="${specie.english_name} (Pokémon)"]`);

        if (specieCase) {
          var curbXP = specieCase.parentElement.parentElement.children[3].textContent.trim();

          switch (curbXP) {
            case 'Erratic':
              curbXP = 'Erratique';
              break;

            case 'Fast':
              curbXP = 'Rapide';
              break;

            case 'Medium Fast':
              curbXP = 'Moyenne';
              break;

            case 'Medium Slow':
              curbXP = 'Parabolique';
              break;

            case 'Slow':
              curbXP = 'Lente';
              break;

            case 'Fluctuating':
              curbXP = 'Fluctuante';
              break;
          }
          await Pokemon_Specie.update({ curbXP }, { where: { id: specie.id } });
        }
      }
    }
  })
}

function evolutionFamily() {
  needle.get(`https://bulbapedia.bulbagarden.net/wiki/List_of_Pok%C3%A9mon_by_evolution_family`, async (err, res) => {
    if (!err && res.statusCode === 200) {
      const dom = new JSDOM(res.body, {
        contentType: 'text/html',
        includeNodeLocations: true,
      });
      const document = dom.window.document;
      const allRows = document.querySelectorAll('table.roundy tr');
      var rowsGroups = {}, actualGroup;

      for (const row of allRows) {
        if (row.children.length === 1) {
          actualGroup = row.textContent.trim().split('*')[0].split(' family')[0];
          rowsGroups[actualGroup] = [];
        } else {
          rowsGroups[actualGroup].push(row);
        }
      }

      delete rowsGroups['Unown'];

      var evolutions = {};
      for (const group in rowsGroups) {
        var i = 0;
        while (i < rowsGroups[group].length) {
          if (i === 0) i++;
          else {
            let firstRow = rowsGroups[group][0];
            let nextRow = rowsGroups[group][i];

            if (nextRow.children.length === firstRow.children.length) {
              let baseText = removeOrigins(firstRow.children[1].textContent.trim());
              let nextText = removeOrigins(nextRow.children[1].textContent.trim());
              
              if (baseText === nextText || !firstRow.children[3]) {
                rowsGroups[group] = rowsGroups[group].splice(i);
              } else {
                i++;
              }
            } else {
              let allRowSpan = firstRow.querySelectorAll('[rowspan]');
              let nextText = removeOrigins(nextRow.children[2].textContent.trim());

              if (allRowSpan.length === 0 && !nextText.includes('→')) {
                rowsGroups[group] = rowsGroups[group].splice(i);
              } else if (allRowSpan.length === 2) {
                let baseText = removeOrigins(firstRow.children[4].textContent.trim());
                if (baseText === nextText) {
                  rowsGroups[group] = rowsGroups[group].splice(i);
                } else {
                  i++;
                }
              } else if (allRowSpan.length === 5) {
                let baseText = removeOrigins(firstRow.children[7].textContent.trim());
                if (baseText === nextText) {
                  rowsGroups[group] = rowsGroups[group].splice(i);
                } else {
                  i++;
                }
              } else {
                i++;
              }
              i++;
            }
          }
        }
      }

      for (const group in rowsGroups) {
        let goodRow = rowsGroups[group][0];
        let babyForm = removeOrigins(goodRow.children[1].textContent.trim());
        evolutions[babyForm] = {};
        if (rowsGroups[group].length === 1) {
          if (goodRow.children.length >= 6) {
            let mediumForm = removeOrigins(goodRow.children[4].textContent.trim());
            evolutions[babyForm][mediumForm] = [];

            if (goodRow.children.length === 8) {
              evolutions[babyForm][mediumForm].push(removeOrigins(goodRow.children[7].textContent.trim()));
            }
          }
        } else {
          var firstRow;
          rowsGroups[group].forEach((row, i) => {
            if (i === 0) {
              firstRow = row;
              let babyForm = removeOrigins(row.children[1].textContent.trim());
              evolutions[babyForm] = {};

              if (row.children.length >= 6) {
                let mediumForm = removeOrigins(row.children[4].textContent.trim());
                evolutions[babyForm][mediumForm] = [];

                if (row.children.length === 8) {
                  evolutions[babyForm][mediumForm].push(removeOrigins(row.children[7].textContent.trim()));
                }
              }
            } else {
              let allRowSpan = firstRow.querySelectorAll('[rowspan]');
              let firstForm, mediumForm;

              switch (allRowSpan.length) {
                case 0:
                  firstForm = removeAllOrigins(row.children[1].textContent.trim());
                  evolutions[firstForm] = {};

                  if (row.children.length >= 6) {
                    mediumForm = removeAllOrigins(row.children[4].textContent.trim());
                    evolutions[firstForm][mediumForm] = [];
    
                    if (row.children.length === 8) {
                      evolutions[firstForm][mediumForm].push(removeAllOrigins(row.children[7].textContent.trim()));
                    }
                  }
                  break;

                case 2:
                  firstForm = removeAllOrigins(firstRow.children[1].textContent.trim());

                  if (row.children.length >= 4) {
                    mediumForm = removeAllOrigins(row.children[2].textContent.trim());

                    if (!mediumForm.includes('→')) {
                      evolutions[firstForm][mediumForm] = [];
  
                      if (row.children.length === 6) {
                        evolutions[firstForm][mediumForm].push(removeAllOrigins(row.children[5].textContent.trim()));
                      }
                    }
                  }
                  break;

                case 5:
                  firstForm = removeAllOrigins(firstRow.children[1].textContent.trim());
                  mediumForm = removeAllOrigins(firstRow.children[4].textContent.trim());

                  evolutions[firstForm][mediumForm].push(removeAllOrigins(row.children[2].textContent.trim()));
              }
            }
          });
        }
      }

      let past = '';
      for (const english_name in evolutions) {
        let evolutionsPast = evolutions[past];
        let evolutionsNow = evolutions[english_name];

        if (!evolutionsPast) {
          evolutionsPast = {};
        }

        let keysPast = Object.keys(evolutionsPast);
        let keysNow = Object.keys(evolutionsNow);

        let listPast = evolutionsPast[keysPast[0]];
        let listNow = evolutionsNow[keysNow[0]];

        if (!listPast) {
          listPast = [];
        }

        if (keysNow.length === 0) {
          delete evolutions[english_name];
        } else if (evolutionsNow) {
          await Pokemon_Specie.update({ starter: true }, { where: { english_name }, include: [Pokemon_Specie.Evolution, Pokemon_Specie.Origin] });
          var [specie, condition] = getCondition(english_name);

          const first = await Pokemon_Specie.findOne({ where: { english_name: specie }, include: [Pokemon_Specie.Evolution, Pokemon_Specie.Origin] });
          let origin;
          if (condition && condition !== '' && condition in origins) {
            origin = await originForm.findOne({ where: { condition }, include: originForm.Species });
            await first.addOrigin(origin);
          } else if (condition === '') {
            condition = null;
          }

          for (const firstEvolution in evolutionsNow) {
            var [firstElementSpecie, firstElementCondition] = getCondition(firstEvolution);
            const evoluted = await Pokemon_Specie.findOne({ where: { english_name: firstElementSpecie }, include: [Pokemon_Specie.Evolution, Pokemon_Specie.Origin] });
            if (english_name.split(' (')[0] !== past || keysPast.length !== keysNow.length || keysPast[0] !== keysNow[0].split(' (')[0] || listPast.length !== listNow.length) {
              await first.addEvolution(evoluted, { through: { conditions: condition } });
            }

            if (firstElementCondition && firstElementCondition !== '' && firstElementCondition in origins) {
              origin = await originForm.findOne({ where: { firstElementCondition }, include: originForm.Species });
              await evoluted.addOrigin(origin);
            } else if (firstElementCondition === '') {
              firstElementCondition = null;
            }

            for (const secondEvolution of evolutionsNow[firstEvolution]) {
              var [secondElementSpecie, secondElementCondition] = getCondition(secondEvolution);
              const fullEvoluted = await Pokemon_Specie.findOne({ where: { english_name: secondElementSpecie }, include: [Pokemon_Specie.Evolution, Pokemon_Specie.Origin] });
              if (english_name.split(' (')[0] !== past || keysPast.length !== keysNow.length || keysPast[0] !== keysNow[0].split(' (')[0] || listPast.length !== listNow.length) {
                await evoluted.addEvolution(fullEvoluted, { through: { conditions: firstElementCondition } });
              }

              if (secondElementCondition && secondElementCondition !== '' && secondElementCondition in origins) {
                origin = await originForm.findOne({ where: { secondElementCondition }, include: originForm.Species });
                await evoluted.addOrigin(origin);
              }
            }
          }
        }

        past = english_name;
      }
    }
  });
}

async function getAllXPBase() {
  const allSpeciesWithoutXPBase = await Pokemon_Specie.findAll({ where: { baseXP: null } });

  for (const specie of allSpeciesWithoutXPBase) {
    let linkName = specie.english_name.replace(' ', '_');
    needle.get(`https://bulbapedia.bulbagarden.net/wiki/${linkName}_(Pok%C3%A9mon)`, async (err, res) => {
      if (!err && res.statusCode === 200) {
        const dom = new JSDOM(res.body, {
          contentType: 'text/html',
          includeNodeLocations: true,
        });
        const document = dom.window.document;
        let yield = document.querySelector('[title="Experience"]').parentElement.parentElement;
        yield = yield.children[1].querySelectorAll('td')[2];
        await specie.update({ baseXP: parseInt(yield.textContent.trim()) });
      }
    });
  }
}

var step = [
  synchronize,
  getPokemonList,
  getBaseXP,
  curbXP,
  evolutionFamily,
  getAllXPBase
];

step[5]();
