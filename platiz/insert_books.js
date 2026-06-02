const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://vhgxevfrgnzbebffejnz.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZ3hldmZyZ256YmViZmZlam56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDE5NDQwNywiZXhwIjoyMDk1NzcwNDA3fQ.0xGDQbV6OvqzZ_wdZpaaclxx_zwlAnM8tFvFv2epkhM');
const fs = require('fs');

const content = fs.readFileSync('books_data.csv', 'utf-8');
const lines = content.split('\n');
const header = lines[0].toLowerCase().split(',');

const idxName = header.findIndex(h => h.includes('nombre') || h.includes('titulo'));
const idxLink = header.findIndex(h => h.includes('link'));
const idxCat = header.findIndex(h => h.includes('categoria'));

const books = [];
for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split(',');
  const link = (parts[idxLink] || '').trim();
  if (!link.includes('drive.google.com/file/d/')) continue;
  let name = (parts[idxName] || '').trim();
  name = name.replace(/^"/, '').replace(/"$/, '');
  const cat = (parts[idxCat] || 'LIBROS').trim();
  const idMatch = link.match(/\/d\/([^\/]+)/);
  const img = idMatch ? 'https://wsrv.nl/?url=' + encodeURIComponent('https://drive.google.com/thumbnail?id=' + idMatch[1] + '&sz=w400') + '&output=webp&w=400&q=75' : '';
  books.push({ title: name || 'Sin titulo', desc: cat, img, link });
}

console.log('Parseados: ' + books.length + ' | Insertando desde 2000...');

async function insertBatch(items, startIdx) {
  const batch = items.slice(startIdx, startIdx + 100);
  if (batch.length === 0) return true;
  const inserts = batch.map((b, i) => ({
    category_slug: 'books',
    title: b.title.substring(0, 200),
    description: b.desc,
    image_url: b.img,
    link: b.link,
    sort_order: startIdx + i + 2011
  }));
  const { error } = await supabase.from('items').insert(inserts);
  if (error) {
    console.log(' ERROR:' + error.message.substring(0, 80));
    return false;
  }
  return true;
}

async function run() {
  let count = 0;
  for (let i = 2000; i < books.length; i += 100) {
    const ok = await insertBatch(books, i);
    if (!ok) break;
    count += Math.min(100, books.length - i);
    if (count % 500 === 0) console.log(' ' + count + '/' + (books.length - 2000));
    process.stdout.write('.');
  }
  console.log('\nTOTAL INSERTADOS: ' + count);
  process.exit(0);
}
run();
