const fs = require('fs');
const content = fs.readFileSync('books_data.csv', 'utf-8');
const lines = content.split('\n');
const header = lines[0].toLowerCase().split(',');
const idxCat = header.findIndex(h => h.includes('categoria'));
const idxLink = header.findIndex(h => h.includes('link'));
const cats = {};
let driveFiles = 0;
let otherLinks = 0;
for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split(',');
  let cat = (parts[idxCat] || 'SIN').trim().replace(/"/g, '');
  if (!cat) cat = 'SIN';
  cats[cat] = (cats[cat] || 0) + 1;
  const link = (parts[idxLink] || '');
  if (link.includes('drive.google.com/file/d/')) driveFiles++;
  else if (link.includes('drive.google.com/drive/folders')) otherLinks++;
  else if (link.trim()) otherLinks++;
}
const sorted = Object.entries(cats).sort((a,b) => b[1] - a[1]);
console.log('TOTAL: ' + (lines.length - 1) + ' registros');
console.log('Drive files: ' + driveFiles + ' | Folders/Otros: ' + otherLinks);
console.log('Categorias (' + Object.keys(cats).length + '):\n');
for (const [cat, count] of sorted) console.log('  ' + cat + ': ' + count);
