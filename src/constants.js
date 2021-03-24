const { resolve } = require('path');

exports.scryfallBulkDataRequestURL = 'https://api.scryfall.com/bulk-data';

exports.scryfallTempFilePath = resolve('./scryfall-oracle-cards.json');

exports.momirDataFilePath = resolve('./data/momir.json');

exports.printerName = 'MHT-P5801';

//
// Address and channel are optional, but have a much shorter connection time than search by name
exports.printerAddress = ''; // expected format: '01:23:45:67:89:AB'
exports.printerChannel = 1;
