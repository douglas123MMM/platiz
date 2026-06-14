require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const productos = [
  // ==================== OFICINA ====================
  { category: 'Oficina', title: 'Microsoft Office (2016 o 2019 o 2021)', description: 'Paquete completo de Microsoft Office', terms: 'Garantia 1 ano / No soporta formateo / 1 Dispositivo / Sistema unicamente Windows', vendor_name: 'Soporte Global Dorado' },
  { category: 'Oficina', title: 'Microsoft Office 2024', description: 'Version mas reciente de Microsoft Office', terms: 'Garantia 1 ano / No soporta formateo / 1 Dispositivo / Sistema unicamente Windows', vendor_name: 'Soporte Global Dorado' },
  { category: 'Oficina', title: 'Microsoft Office 365 A1 - Correo Generado', description: 'Office 365 basico con correo institucional', terms: 'Reinstalable / 5 Dispositivos / Sistemas Windows, Mac, Android y iOS', vendor_name: 'Soporte Global Dorado' },
  { category: 'Oficina', title: 'Microsoft Office 365 A1 + 100GB - Correo Generado', description: 'Office 365 basico + 100GB OneDrive con correo institucional', terms: 'Reinstalable / 5 Dispositivos / Sistemas Windows, Mac, Android y iOS', vendor_name: 'Soporte Global Dorado' },
  { category: 'Oficina', title: 'Microsoft Office 365 + 1TB - Correo Personal', description: 'Office 365 completo + 1TB OneDrive con tu correo personal', terms: 'Reinstalable / 5 Dispositivos / Sistemas Windows, Mac, Android y iOS', vendor_name: 'Soporte Global Dorado' },
  { category: 'Oficina', title: 'Microsoft Office 365 + 1TB + IA Copilot - Correo Generado', description: 'Office 365 completo + 1TB OneDrive + IA Copilot integrada', terms: 'Reinstalable / 5 Dispositivos / Sistemas Windows, Mac, Android y iOS', vendor_name: 'Soporte Global Dorado' },
  { category: 'Oficina', title: 'Microsoft Visio (2016 o 2019 o 2021)', description: 'Software de diagramacion y graficos vectoriales', terms: 'Garantia 1 ano / No soporta formateo / 1 Dispositivo / Sistema unicamente Windows', vendor_name: 'Soporte Global Dorado' },
  { category: 'Oficina', title: 'Microsoft Visio 2024', description: 'Version mas reciente de Microsoft Visio', terms: 'Garantia 1 ano / No soporta formateo / 1 Dispositivo / Sistema unicamente Windows', vendor_name: 'Soporte Global Dorado' },
  { category: 'Oficina', title: 'Microsoft Project (2016 o 2019 o 2021)', description: 'Software de gestion de proyectos profesionales', terms: 'Garantia 1 ano / No soporta formateo / 1 Dispositivo / Sistema unicamente Windows', vendor_name: 'Soporte Global Dorado' },
  { category: 'Oficina', title: 'Microsoft Project 2024', description: 'Version mas reciente de Microsoft Project', terms: 'Garantia 1 ano / No soporta formateo / 1 Dispositivo / Sistema unicamente Windows', vendor_name: 'Soporte Global Dorado' },
  { category: 'Oficina', title: 'Nitro PDF 10 - Licencia Permanente', description: 'Editor PDF profesional con licencia permanente', terms: 'Reinstalable / 1 Dispositivo / Sistema Windows', vendor_name: 'Soporte Global Dorado' },
  { category: 'Oficina', title: 'Nitro PDF 14 - Licencia Permanente', description: 'Editor PDF profesional con licencia permanente - Consultar Stock', terms: 'Reinstalable / 1 Dispositivo / Sistema Windows', vendor_name: 'Soporte Global Dorado', stock: 0 },
  { category: 'Herramientas', title: 'Power BI - 1 ano', description: 'Analisis de datos y visualizacion empresarial - Consultar Stock', terms: 'Reinstalable / 1 Dispositivo / Sistemas Windows y Mac', vendor_name: 'Soporte Global Dorado', stock: 0 },
  { category: 'Herramientas', title: 'Power BI - 2 anos', description: 'Analisis de datos y visualizacion empresarial - Consultar Stock', terms: 'Reinstalable / 1 Dispositivo / Sistemas Windows y Mac', vendor_name: 'Soporte Global Dorado', stock: 0 },

  // ==================== LICENCIA ====================
  { category: 'Licencia', title: 'Windows 10/11 RETAIL', description: 'Licencia oficial Windows 10/11 version RETAIL', terms: 'Garantia 1 ano / 1 Dispositivo / No soporta formateo / Sistema unicamente Windows', vendor_name: 'Soporte Global Dorado' },
  { category: 'Licencia', title: 'Windows 10/11 OEM', description: 'Licencia oficial Windows 10/11 version OEM', terms: 'Garantia 1 ano / 1 Dispositivo / Reinstalable en la misma PC / Sistema unicamente Windows', vendor_name: 'Soporte Global Dorado' },

  // ==================== ANTIVIRUS ====================
  { category: 'Antivirus', title: 'Nod 32 - 1 ano VPN', description: 'Antivirus ESET Nod32 con VPN incluida por 1 ano', terms: 'Reinstalable / 1 Dispositivo / Sistemas Windows y Mac', vendor_name: 'Soporte Global Dorado' },
  { category: 'Antivirus', title: 'Nod 32 - 2 anos VPN', description: 'Antivirus ESET Nod32 con VPN incluida por 2 anos', terms: 'Reinstalable / 1 Dispositivo / Sistemas Windows y Mac', vendor_name: 'Soporte Global Dorado' },
  { category: 'Antivirus', title: 'Nod 32 - 1 ano Directa', description: 'Antivirus ESET Nod32 licencia directa por 1 ano', terms: 'Reinstalable / 1 Dispositivo / Sistemas Windows y Mac', vendor_name: 'Soporte Global Dorado' },
  { category: 'Antivirus', title: 'Internet Security / Home Security Essential - 1 ano', description: 'ESET Internet Security o Home Security Essential - Consultar por Stock', terms: 'Reinstalable / 1 Dispositivo / Sistemas Windows y Mac', vendor_name: 'Soporte Global Dorado', stock: 0 },
  { category: 'Antivirus', title: 'Smart Security Premium / Home Security Premium - 1 ano', description: 'ESET Smart Security Premium o Home Security Premium - Consultar por Stock', terms: 'Reinstalable / 1 Dispositivo / Sistemas Windows y Mac', vendor_name: 'Soporte Global Dorado', stock: 0 },
  { category: 'Antivirus', title: 'McAfee Antivirus', description: 'Proteccion esencial McAfee', terms: 'Reinstalable / 1 Dispositivo / Sistemas Windows y Mac', vendor_name: 'Soporte Global Dorado' },
  { category: 'Antivirus', title: 'McAfee Internet Security - 1 ano', description: 'McAfee Internet Security proteccion completa - Consultar por Stock', terms: 'Reinstalable / 1 Dispositivo / Sistemas Windows y Mac', vendor_name: 'Soporte Global Dorado', stock: 0 },
  { category: 'Antivirus', title: 'Avast Premium Security - 1 ano', description: 'Avast Premium Security proteccion avanzada - Consultar por Stock', terms: 'Reinstalable / 1 Dispositivo / Sistemas Windows y Mac', vendor_name: 'Soporte Global Dorado', stock: 0 },
  { category: 'Antivirus', title: 'Avast Ultimate Suite - 1 ano', description: 'Avast Ultimate Suite proteccion total - Consultar por Stock', terms: 'Reinstalable / 1 Dispositivo / Sistemas Windows y Mac', vendor_name: 'Soporte Global Dorado', stock: 0 },
  { category: 'Antivirus', title: 'AVG Internet Security - 1 ano', description: 'AVG Internet Security proteccion integral - Consultar por Stock', terms: 'Reinstalable / 1 Dispositivo / Sistemas Windows y Mac', vendor_name: 'Soporte Global Dorado', stock: 0 },
  { category: 'Antivirus', title: 'Kaspersky Standard - 1 ano', description: 'Kaspersky Standard proteccion basica - Consultar por Stock', terms: 'Reinstalable / 1 Dispositivo / Sistemas Windows y Mac', vendor_name: 'Soporte Global Dorado', stock: 0 },
  { category: 'Antivirus', title: 'Kaspersky Plus - 1 ano', description: 'Kaspersky Plus proteccion avanzada - Consultar por Stock', terms: 'Reinstalable / 1 Dispositivo / Sistemas Windows y Mac', vendor_name: 'Soporte Global Dorado', stock: 0 },
  { category: 'Antivirus', title: 'Kaspersky Total Security - 1 ano', description: 'Kaspersky Total Security proteccion completa - Consultar por Stock', terms: 'Reinstalable / 1 Dispositivo / Sistemas Windows y Mac', vendor_name: 'Soporte Global Dorado', stock: 0 },
  { category: 'Antivirus', title: 'Kaspersky Premium - 1 ano', description: 'Kaspersky Premium maxima proteccion - Consultar por Stock', terms: 'Reinstalable / 1 Dispositivo / Sistemas Windows y Mac', vendor_name: 'Soporte Global Dorado', stock: 0 },
  { category: 'Antivirus', title: 'Kaspersky Premium VPN Ilimitada - 1 ano', description: 'Kaspersky Premium + VPN ilimitada - Consultar por Stock', terms: 'Reinstalable / 1 Dispositivo / Sistemas Windows y Mac', vendor_name: 'Soporte Global Dorado', stock: 0 },
  { category: 'Antivirus', title: 'Bitdefender Plus - 1 ano', description: 'Bitdefender Plus proteccion avanzada - Consultar por Stock', terms: 'Reinstalable / 1 Dispositivo / Sistemas Windows y Mac', vendor_name: 'Soporte Global Dorado', stock: 0 },
  { category: 'Antivirus', title: 'Bitdefender Total Security - 1 ano', description: 'Bitdefender Total Security proteccion total - Consultar por Stock', terms: 'Reinstalable / 1 Dispositivo / Sistemas Windows y Mac', vendor_name: 'Soporte Global Dorado', stock: 0 },
  { category: 'Antivirus', title: 'Norton 365 Premium - 1 ano', description: 'Norton 365 Premium proteccion completa - Consultar por Stock', terms: 'Reinstalable / 1 Dispositivo / Sistemas Windows y Mac', vendor_name: 'Soporte Global Dorado', stock: 0 },
  { category: 'Antivirus', title: 'Norton Plus - 1 ano', description: 'Norton Plus proteccion esencial - Consultar por Stock', terms: 'Reinstalable / 1 Dispositivo / Sistemas Windows y Mac', vendor_name: 'Soporte Global Dorado', stock: 0 },

  // ==================== DISENO GRAFICO ====================
  { category: 'Diseno Grafico', title: 'Autodesk Edu - Correo Generado - 1 ano', description: 'Autodesk Suite Educativa con correo institucional generado', terms: 'Si tiene aplicaciones de Autodesk instaladas previamente (versiones no oficiales / piratas), eliminelas completamente desde la raiz. De lo contrario, el servicio presentara fallas.\n\nReinstalable / 1 Dispositivo / Sistemas Windows y Mac', vendor_name: 'Soporte Global Dorado' },
  { category: 'Diseno Grafico', title: 'Autodesk Edu - Correo Personal - 1 ano', description: 'Autodesk Suite Educativa vinculada a tu correo personal', terms: 'Si tiene aplicaciones de Autodesk instaladas previamente (versiones no oficiales / piratas), eliminelas completamente desde la raiz. De lo contrario, el servicio presentara fallas.\n\nReinstalable / 1 Dispositivo / Sistemas Windows y Mac', vendor_name: 'Soporte Global Dorado' },
  { category: 'Diseno Grafico', title: 'CorelDraw Technical 2024 espanol - Windows', description: 'CorelDraw Technical Suite 2024 en espanol para Windows', terms: 'Si tiene aplicaciones de Corel instaladas previamente (versiones antiguas, no oficiales / piratas), eliminelas completamente desde la raiz. De lo contrario, el servicio presentara fallas.\n\nReinstalable / 1 Dispositivo / Sistema Windows', vendor_name: 'Soporte Global Dorado' },
  { category: 'Diseno Grafico', title: 'CorelDraw Graphics Suite 2024 espanol - Mac', description: 'CorelDraw Graphics Suite 2024 en espanol para Mac', terms: 'Si tiene aplicaciones de Corel instaladas previamente (versiones antiguas, no oficiales / piratas), eliminelas completamente desde la raiz. De lo contrario, el servicio presentara fallas.\n\nReinstalable / 1 Dispositivo / Sistema Mac', vendor_name: 'Soporte Global Dorado' },
  { category: 'Diseno Grafico', title: 'CorelDraw Technical 2025 espanol - Windows', description: 'CorelDraw Technical Suite 2025 en espanol para Windows', terms: 'Si tiene aplicaciones de Corel instaladas previamente (versiones antiguas, no oficiales / piratas), eliminelas completamente desde la raiz. De lo contrario, el servicio presentara fallas.\n\nReinstalable / 1 Dispositivo / Sistema Windows', vendor_name: 'Soporte Global Dorado' },
  { category: 'Diseno Grafico', title: 'CorelDraw Graphics Suite 2025 espanol - Mac', description: 'CorelDraw Graphics Suite 2025 en espanol para Mac', terms: 'Si tiene aplicaciones de Corel instaladas previamente (versiones antiguas, no oficiales / piratas), eliminelas completamente desde la raiz. De lo contrario, el servicio presentara fallas.\n\nReinstalable / 1 Dispositivo / Sistema Mac', vendor_name: 'Soporte Global Dorado' },

  // ==================== CREATIVIDAD ====================
  { category: 'Creatividad', title: 'Adobe Creative Cloud - 1 mes', description: 'Suite completa Adobe CC: Photoshop, Illustrator, Premiere Pro y mas', terms: 'Reinstalable / 2 Dispositivos / Sistemas Windows y Mac', vendor_name: 'Soporte Global Dorado' },
  { category: 'Creatividad', title: 'Adobe Creative Cloud - 3 meses', description: 'Suite completa Adobe CC: Photoshop, Illustrator, Premiere Pro y mas', terms: 'Reinstalable / 2 Dispositivos / Sistemas Windows y Mac', vendor_name: 'Soporte Global Dorado' },
  { category: 'Creatividad', title: 'Adobe Creative Cloud - 6 meses', description: 'Suite completa Adobe CC: Photoshop, Illustrator, Premiere Pro y mas', terms: 'Reinstalable / 2 Dispositivos / Sistemas Windows y Mac', vendor_name: 'Soporte Global Dorado' },
  { category: 'Creatividad', title: 'Adobe Creative Cloud - 1 ano', description: 'Suite completa Adobe CC: Photoshop, Illustrator, Premiere Pro y mas', terms: 'Reinstalable / 2 Dispositivos / Sistemas Windows y Mac', vendor_name: 'Soporte Global Dorado' },
  { category: 'Creatividad', title: 'Adobe Creative Cloud KEY - 1 ano', description: 'Suite completa Adobe CC con activacion por KEY - Licencia Estable', terms: 'Licencias Estable / Reinstalable / 2 Dispositivos / Sistemas Windows y Mac', vendor_name: 'Soporte Global Dorado' },
  { category: 'Creatividad', title: 'Canva Pro Edu - 1 mes', description: 'Canva Pro version educativa con todas las funciones premium', terms: 'Correo personal / Reinstalable / En cualquier dispositivo / Sistemas Windows, Mac, Android y iOS', vendor_name: 'Soporte Global Dorado' },
  { category: 'Creatividad', title: 'Canva Pro Edu - 3 meses', description: 'Canva Pro version educativa con todas las funciones premium', terms: 'Correo personal / Reinstalable / En cualquier dispositivo / Sistemas Windows, Mac, Android y iOS', vendor_name: 'Soporte Global Dorado' },
  { category: 'Creatividad', title: 'Canva Pro Edu - 6 meses', description: 'Canva Pro version educativa con todas las funciones premium', terms: 'Correo personal / Reinstalable / En cualquier dispositivo / Sistemas Windows, Mac, Android y iOS', vendor_name: 'Soporte Global Dorado' },
  { category: 'Creatividad', title: 'Canva Pro Edu - 1 ano', description: 'Canva Pro version educativa con todas las funciones premium', terms: 'Correo personal / Reinstalable / En cualquier dispositivo / Sistemas Windows, Mac, Android y iOS', vendor_name: 'Soporte Global Dorado' },

  // ==================== EDICION DE VIDEOS ====================
  { category: 'Edicion de Videos', title: 'Camtasia Studio 6', description: 'Software de grabacion y edicion de video profesional', terms: 'Garantia 1 ano / Reinstalable / 1 Dispositivo / Sistema unicamente Windows', vendor_name: 'Soporte Global Dorado' },
];

async function insertar() {
  let count = 0;
  for (const p of productos) {
    const { error } = await supabase.from('store_products').insert({
      category: p.category,
      title: p.title,
      description: p.description,
      terms: p.terms,
      price: 0,
      stock: p.stock !== undefined ? p.stock : 999,
      delivery_type: 'manual',
      account_type: 'permanente',
      vendor_name: p.vendor_name,
      renewable: false,
      active: true,
    });
    if (!error) { count++; console.log(count + '. ' + p.title); }
    else console.log('ERR: ' + p.title.substring(0, 40) + ' -> ' + error.message);
  }
  console.log('\n' + count + ' de ' + productos.length + ' productos insertados en la tienda!');
  process.exit(0);
}

insertar();
