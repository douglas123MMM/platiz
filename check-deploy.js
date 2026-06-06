fetch('https://platiz.vercel.app/assets/index-CHurwhI-.js')
  .then(r => r.text())
  .then(t => {
    console.log('Has Mi Oficina:', t.includes('Mi Oficina'));
    console.log('Has Redes Sociales:', t.includes('Redes Sociales'));
    console.log('Has afiliado path:', t.includes('"/afiliado"'));
    // Check for the actual data flow via variable names (may be minified)
    console.log('Has payment_methods key:', t.includes('payment_methods'));
    console.log('Has whatsapp key:', t.includes('whatsapp'));
  });
