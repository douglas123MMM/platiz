const puppeteer = require('puppeteer');
const fs = require('fs');

const LINKS_FILE = './scripts/canva-links.json';
const RESULTS_FILE = './scripts/canva-results.json';

(async () => {
  const links = JSON.parse(fs.readFileSync(LINKS_FILE, 'utf8'));
  console.log(`\n=== CANVA CLONER (usando tu Chrome) ===`);
  console.log(`${links.length} disenios\n`);

  // Conectar a Chrome existente
  console.log('Conectando a tu Chrome...');
  const browser = await puppeteer.connect({
    browserURL: 'http://localhost:9222',
    defaultViewport: { width: 1366, height: 768 },
  });

  const pages = await browser.pages();
  let page = pages.find(p => p.url().includes('canva.com')) || pages[0];
  
  // Si no hay pagina de Canva, abrir una
  if (!page.url().includes('canva.com')) {
    page = await browser.newPage();
    await page.goto('https://www.canva.com', { waitUntil: 'networkidle2' });
  }

  console.log('>>> Conectado. Asegurate de haber iniciado sesion en Canva en esta ventana.');
  console.log('>>> Cuando estes listo, el script espera 10 segundos y empieza solo.\n');
  await new Promise(r => setTimeout(r, 10000));

  // Verificar que el usuario esta logueado en Canva
  await page.goto('https://www.canva.com', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  const isLoggedIn = await page.evaluate(() => {
    // Si la URL tiene /login, no ha iniciado sesion
    return !window.location.href.includes('/login') && !window.location.href.includes('/signup');
  });

  if (!isLoggedIn) {
    console.log('>>> No se detecto sesion activa en Canva. Inicia sesion y vuelve a ejecutar.');
    console.log('>>> Cerrando...');
    await browser.disconnect();
    return;
  }

  console.log('>>> Sesion detectada! Clonando...\n');

  const results = [];

  for (let i = 0; i < links.length; i++) {
    const item = links[i];
    console.log(`[${i + 1}/${links.length}] ${item.title}`);

    try {
      // Convertir URL a /edit para forzar creacion de copia
      const editUrl = item.url.replace('/view', '/edit').replace('?mode=preview', '');
      console.log(`   URL edit: ${editUrl}`);
      await page.goto(editUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 5000));

      // En /edit, Canva deberia mostrar un dialogo de "crear copia"
      let clicked = await page.evaluate(() => {
        const all = document.querySelectorAll('button, a, [role="button"], span, div[role="dialog"] button');
        const keywords = [
          'make a copy', 'create a copy', 'crear una copia',
          'use template', 'usar plantilla', 'edit a copy', 'editar copia',
          'copy and edit', 'copiar y editar', 'create copy', 'crear copia',
          'make copy', 'do it', 'hacerlo', 'usar diseno', 'use this design',
          'remix', 'personalizar', 'customize', 'confirm', 'confirmar',
          'i understand', 'entiendo', 'got it', 'aceptar', 'accept'
        ];
        for (const el of all) {
          const text = (el.textContent || '').toLowerCase().trim();
          const aria = (el.getAttribute('aria-label') || '').toLowerCase();
          for (const kw of keywords) {
            if (text === kw || aria === kw || text.includes(kw) || aria.includes(kw)) {
              try { el.click(); } catch {}
              return kw + ' | text: ' + text.substring(0, 30);
            }
          }
        }
        return null;
      });

      if (clicked) {
        console.log(`   + Clickeado: "${clicked}"`);
        // Esperar a que el editor cargue
        await new Promise(r => setTimeout(r, 6000));

        // Si no cambio la URL, intentar atajo de teclado para copiar
        let newUrl = page.url();
        if (!newUrl.includes('/edit')) {
          // Intentar Ctrl+Shift+? en Canva o File menu
          console.log('   Intentando crear copia via teclado...');
          // File menu: Alt+F en Windows
          try {
            await page.keyboard.down('Alt');
            await new Promise(r => setTimeout(r, 500));
            await page.keyboard.press('KeyF');
            await new Promise(r => setTimeout(r, 500));
            await page.keyboard.up('Alt');
            await new Promise(r => setTimeout(r, 1000));
            // Presionar enter en "Make a copy"
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('Enter');
            await new Promise(r => setTimeout(r, 5000));
          } catch {}
          newUrl = page.url();
        }

        const cleanUrl = newUrl.split('?')[0].split('#')[0];
        console.log(`   >>> ${cleanUrl}`);
        
        results.push({
          id: item.id,
          title: item.title,
          old: item.url,
          new: cleanUrl,
          status: cleanUrl.includes('/edit') ? 'ok' : 'check',
        });
      } else {
        console.log(`   - Boton no encontrado. La pagina quiza requiere ser dueno del diseno.`);
        // Guardar URL actual por si acaso
        results.push({
          id: item.id,
          title: item.title,
          old: item.url,
          new: null,
          status: 'no_button',
        });
      }
    } catch (err) {
      console.log(`   ERROR: ${err.message}`);
      results.push({
        id: item.id,
        title: item.title,
        old: item.url,
        new: null,
        status: 'error',
        error: err.message,
      });
    }

    fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
    await new Promise(r => setTimeout(r, 1000));
  }

  const ok = results.filter(r => r.status === 'ok' || r.status === 'check').length;
  console.log(`\n=== FIN ===`);
  console.log(`Procesados: ${ok}/${links.length}`);
  console.log(`Resultados: ${RESULTS_FILE}`);

  if (results.some(r => r.new)) {
    console.log('\n--- NUEVOS ENLACES ---');
    results.filter(r => r.new).forEach(r => console.log(`${r.title}: ${r.new}`));
  }

  await browser.disconnect();
  console.log('\nListo. No cierres Chrome, te puede servir para revisar.');
})();
