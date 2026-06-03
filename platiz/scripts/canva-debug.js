const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  // Conectar a Chrome existente
  const browser = await puppeteer.connect({
    browserURL: 'http://localhost:9222',
    defaultViewport: { width: 1366, height: 768 },
  });

  const page = await browser.newPage();
  
  // Abrir el primer disenio
  const url = 'https://www.canva.com/design/DAGH8FDJOzk/NSRIdc4jMhJf9-Vb1-YrlQ/view';
  console.log('Abriendo:', url);
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  
  // Esperar a que cargue completamente
  await new Promise(r => setTimeout(r, 5000));
  
  // Tomar screenshot
  await page.screenshot({ path: './scripts/canva-page.png', fullPage: false });
  console.log('Screenshot guardado: scripts/canva-page.png');
  
  // Ver que elementos hay en la pagina
  const info = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
    return {
      url: window.location.href,
      title: document.title,
      buttons: buttons.slice(0, 20).map(b => ({
        tag: b.tagName,
        text: (b.textContent || '').trim().substring(0, 50),
        class: b.className?.substring(0, 40),
        visible: b.offsetParent !== null,
      })),
      allText: document.body?.innerText?.substring(0, 500),
    };
  });
  
  console.log(JSON.stringify(info, null, 2));
  
  await browser.disconnect();
})();
