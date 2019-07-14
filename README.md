# Momir Basic console prototype
Interactive Momir Basic console application that prints out cards on a receipt printer.

## Requirements
- nodejs >= 8
- (optional) bluetooth-ready, ESC/POS compatible printer

## Installation
(Note: Installation will download ~80MB of card data.)
```bash
git clone git@github.com:pfirpfel/momir-prototype-nodejs.git
cd momir-prototype-nodejs
npm install
```

## Update momir data
Initially, this will be done by running `npm install`. But if new cards have been printed since the last run, you can
delete the source data and re-build the momir data:
```bash
rm scryfall-oracle-cards.json
npm run install
```

## Usage

### Console output only
Run:
```bash
npm run momir
```

The programm is ready as soon as the dialog `CMC?` appears. Enter a number and press return to output a creature card
with converted mana cost of the entered number.

### Console output + receipt print
Configure printer name and/or address and channel in `src/constants.js`:
```javascript
exports.printerName = 'MHT-P5801';

exports.printerAddress = '01:23:45:67:89:AB';
exports.printerChannel = 1;

```

Run:
```bash
npm run momir-print
```

## Appendix

### Momir Basic
Momir basic is a Magic: The Gathering play variant based on the
[Momir Vig Vanguard avatar](https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=182271).

All players use a deck consisting of exactly 60 basic lands and one Momir Vig Vanguard avatar.
The avatars modifies the starting life total of each player to 24 life an has the following ability:

> {X}, Discard a card: Create a token that's a copy of a creature card with converted mana cost X chosen at random.
> Activate this ability only any time you could cast a sorcery and only once each turn.
