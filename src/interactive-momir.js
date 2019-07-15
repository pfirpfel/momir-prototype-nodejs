const PRINT_ENABLED = process.argv.length === 3 && process.argv[2] === '--print';

const { momirDataFilePath, printerName, printerAddress, printerChannel } = require('./constants');
const momirCards = require(momirDataFilePath);
const readline = require('readline');

const getMomir = function(cmc) {
  let momir = null;
  if (momirCards[cmc]) {
    momir = momirCards[cmc][Math.floor(momirCards[cmc].length*Math.random())];
  }
  return momir;
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askForCMC = function() {
  return new Promise( (resolve) => {
    rl.question( 'CMC?', user_cmc => {
      let cmc = parseInt(user_cmc, 10);
      resolve(cmc);
    })
  });
};

let availablePrinters = null;
let device = null;
let printer = null;

const setupPrinter = async function(){
  try {
    const { Bluetooth, Printer } = require('escpos');
    let btPrinterName = printerName;
    let btAddress = printerAddress; // expected format: '01:23:45:67:89:AB'
    let btChannel = printerChannel;

    // if address or channel are invalid, search by name instead
    if (btAddress.length !== 17 || !Number.isFinite(btChannel)) {
      console.log("Searching for printers...");
      availablePrinters = await Bluetooth.findPrinters();
      if (availablePrinters.length == 0) {
        throw new Error('No printers found!');
      }
      const namedPrinters = availablePrinters.filter(p => p && p.name === printerName);
      if (namedPrinters.length < 1) {
        throw new Error(`No printer with name '${printerName}' found!`);
      }
      btPrinterName = namedPrinters[0].name;
      btAddress = namedPrinters[0].address;
      btChannel = namedPrinters[0].channel;
    }

    device = await Bluetooth.getDevice(btAddress, btChannel);
    printer = await Printer.create(device);
    console.log(`Printer ${btPrinterName} (address: ${btAddress} channel: ${btChannel}) connected.`);
  } catch (err) {
    console.log(`Error during printer setup ${err}`);
    process.exit()
  }
};

(async function main() {
  if (PRINT_ENABLED) {
    await setupPrinter();
  };
  let continueMomir = true;
  while(continueMomir) {
    try {
      let cmc = await askForCMC();
      // non-numeric input ends the ask-loop
      if (!isFinite(cmc)) {
        continueMomir = false;
        continue;
      }
      const momir = getMomir(cmc);
      if (momir === null) {
        console.log(`No creature found for CMC=${cmc}`);
        continue;
      }
      const lines = [
        `${momir.name} - ${momir.mana_cost}`,
        momir.type_line,
        momir.oracle_text,
        `${momir.power}/${momir.toughness}`
      ];
      lines.forEach(line => console.log(line));
      if (PRINT_ENABLED) {
        await printer.align('LT');
        await printer.size(1, 1);
        await printer.text(`${momir.name} - ${momir.mana_cost}`,);
        await printer.feed(1);
        await printer.text(momir.type_line);
        await printer.feed(1);
        await printer.text(momir.oracle_text);
        await printer.feed(1);
        await printer.align('RT');
        await printer.size(2, 2);
        await printer.text(`${momir.power}/${momir.toughness}`);
        await printer.feed(2);
        await printer.flush();
      }
    } catch (err) {
      console.log('Error', err);
      continueMomir = false;
    }
  }
  if (PRINT_ENABLED && printer) {
    await printer.close();
  }
  process.exit()
})();
