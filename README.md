# Momir basic console prototype
Interactive momir basic console application that prints out cards on a receipt printer.

## Requirements
- nodejs >= 8
- (optional) bluetooth-ready, ESC/POS compatible printer

## Installation

```bash
git clone git@github.com:pfirpfel/momir-prototype-nodejs.git
cd momir-prototype-nodejs
npm install
npm run install
```

## Usage

### Console output only
Run:
```bash
npm run momir
```

### Console output + receipt print
Configure printer name in `src/constants.js`:
```javascript
exports.printerName = 'MHT-P5801';
```

Run:
```bash
npm run momir-print
```
