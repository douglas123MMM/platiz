(async () => {
  const { createClient } = require('@supabase/supabase-js');
  const s = createClient(
    'https://vhgxevfrgnzbebffejnz.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZ3hldmZyZ256YmViZmZlam56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDE5NDQwNywiZXhwIjoyMDk1NzcwNDA3fQ.0xGDQbV6OvqzZ_wdZpaaclxx_zwlAnM8tFvFv2epkhM',
    { auth: { persistSession: false } }
  );
  const now = new Date().toISOString();
  const rows = [
    ['1700 VIDEOS Y POST', 'DAGRNIj1zRI/aIDz3PSMQQJuni35n-a2bg'],
    ['800 VIDEOS FACELESS', 'DAGGPl5ScVI/J52yISMVnCjDS4Ktprrwug'],
    ['50 VIDEOS DE CAFFE', 'DAGdOi0ZCVE/Pkcg35E6dDmO3n1dxiR0yg'],
    ['87 VIDEOS PARA REELS', 'DAGdOs9vY_E/pfaMbAasG0xN_FdNe_KQLQ'],
    ['40 REELS HECHOS PARA TI', 'DAGeFVcsdns/3JcsLa8s7xT_yDr8bFhBFw'],
    ['PACK 70 VIDEOS FACELESS HOMBRES', 'DAGIB8BP0-c/7uOG-prrp9jHp6hW4Tr0yQ'],
    ['50 REELS DE MENTALIDAD', 'DAGh16O546k/4vFL0sWoi4KFGa6wOa2Ekg'],
    ['200 REELS CON HOOKS', 'DAGh13fI4JY/40ZcB6lnjDD9-e42lQF3-w'],
    ['50 CARRUSELES MARKETING DIGITAL', 'DAGhRF2K-2w/h_T4F_Gt00TFnahxUQyS1Q'],
    ['50 CARRUSEL MOTIVACIONAL', 'DAGhRHO6Baw/arFJtqf0pxDGL1D62nerRg'],
    ['105 POST CITAS FACELESS', 'DAGhRLJCbjU/YBo4b7J3VCMt_KXanjAiQA'],
    ['50 POST ORGANICO VERDE', 'DAGA_EIBohA/WCXpiz2lsveYz9rGGHFY3w'],
  ];
  for (let i = 0; i < rows.length; i++) {
    const [title, id] = rows[i];
    const { error } = await s.from('items').insert({
      category_slug: 'plr-pro', title, description: 'Plantilla Video/Contenido PLR',
      link: 'https://www.canva.com/design/' + id + '/view',
      sort_order: 121 + i, active: 1, created_at: now, updated_at: now,
    });
    console.log(error ? 'ERR: ' + error.message : 'OK: ' + title);
  }
  console.log('Total ~' + (121 + rows.length));
})();
