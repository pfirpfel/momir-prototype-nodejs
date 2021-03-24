const { downloadFile, downloadJSON,  fileExists, writeFile } = require('./util');
const { scryfallBulkDataRequestURL,  scryfallTempFilePath, momirDataFilePath } = require('./constants');

const isNontokenCreatureCard = (card) => {
  return card.type_line.includes('Creature') // must have Creature in its type
    && !card.layout.includes('token') && card.layout !== 'augment' // must be a real card (no token or augment)
    && (card.card_faces === undefined || // in case of a flip card, front side must be a creature
      (card.card_faces !== undefined && card.card_faces[0].type_line.includes('Creature')))
	&& !(card.layout.includes('meld') && card.mana_cost == '') // exclude meld results (= back sides)
    && (card.set_type === undefined || // exclude joke sets (Unglued, Unhinged, Unstable)
      (card.set_type !== undefined && card.set_type !== 'funny'));
};

(async function main() {
  try {
    console.log(`Check if ${scryfallTempFilePath} already exists...`)
    const scryfallExists = await fileExists(scryfallTempFilePath);
    if (!scryfallExists) {
      const bulkData = await downloadJSON(scryfallBulkDataRequestURL);
      let scryfallURL = '';
      if (bulkData && bulkData.hasOwnProperty('data') && Array.isArray(bulkData.data)) {
        scryfallURL = bulkData.data.filter(entry => entry.name === 'Oracle Cards')[0]['download_uri'];
      } else {
        throw new Error(`Error while retrieving Scryfall bulk data: ${bulkData}`);
      }
      console.log(`Downloading '${scryfallURL}' to '${scryfallTempFilePath}'...`);
      await downloadFile(scryfallURL, scryfallTempFilePath);
    }

    console.log('Process card data...')
    const scryfallCards = require(scryfallTempFilePath);

    // Get rid of unneeded fields
    const cleanCreatures = scryfallCards.filter(isNontokenCreatureCard).map(card => {
      // Handle flip/transform cards:
      // Just overwrite all values with those of the front side
      if (card.card_faces !== undefined) {
        Object.keys(card.card_faces[0]).forEach(key => {
          card[key] = card.card_faces[0][key];
        });
      }
      return {
        name: card.name,
        cmc: card.cmc,
        uri: card.uri,
        mana_cost: card.mana_cost,
        type_line: card.type_line.replace('\u2014', '-'),
        oracle_text: card.oracle_text,
        power: card.power,
        toughness: card.toughness,
        image: card.image_uris && card.image_uris.art_crop ? card.image_uris.art_crop : null
      };
    });

    // Group by cmc
    const creaturesByCMC = cleanCreatures.reduce((acc, curr) => {
      if (!(curr.cmc in acc)) {
        acc[curr.cmc] = [];
      }
      acc[curr.cmc].push(curr);
      return acc;
    }, {});

    // Write processed momir data to file
    const json = JSON.stringify(creaturesByCMC);
    console.log(`Write momir data to '${momirDataFilePath}'...`);
    await writeFile(json, momirDataFilePath);
    console.log('Done!');
  } catch(err){
    console.log(`An error occured: ${err}`);
  }
})();
