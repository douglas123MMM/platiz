(async () => {
  require('dotenv').config();
  const { createClient } = require('@supabase/supabase-js');
  const s = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    { auth: { persistSession: false } }
  );
  const now = new Date().toISOString();
  const ts = [
    ['200 IDEAS DE PRODUCTOS DIGITALES','DAGhROzGJQg/XyVoNXy9rpIymoem5z0fcw'],
    ['PRODUCTOS DIGITALES PARA GENERAR INGRESOS','DAGhRJvkCEI/EEcwU0NTx8aVToY9-s8KEQ'],
    ['Crea y vende productos digitales con derechos de reventa','DAGhRKqgN5Y/2oWvL_ekBINLCI-KwxOWgA'],
    ['AUDITORIA DE PERFIL','DAGhRLoCvq0/XG6w8kcoWvp7B05KMHP1ZA'],
    ['COMO CREAR Y VENDER PRODUCTOS DIGITALES','DAGhRDZH9RM/4BVWtlTUkQyOk-ka-DnO9w'],
    ['20 IDEAS DE PRODUCTOS DIGITALES','DAGhQ6ZhxsI/0skfr_gfCDr3ACLQ-pnWig'],
    ['CONVERTIR PASIONES EN GANANCIAS','DAGhRBZXW34/E3J3isugSMXq18i-ulBphA'],
    ['GUIA DEFINITIVA DE INGRESOS AUTOMATIZADOS','DAGhQ2HXPdY/3EaaN7SaXcsmdXDJsZXkAw'],
    ['VENDE POR HISTORIAS','DAGhQ2lBfjQ/TfFvFU8pmx5q84vmnN2XIg'],
    ['INGRESOS FACELESS EN INSTAGRAM','DAF7TRFqnDY/XT2EuQ_X_9P8Z2BCP0VACQ'],
    ['GUIA PAGINAS TEMATICAS EN INSTAGRAM','DAGecKYLQZ4/WdakqvjHOvwVOUDR1SNIvQ'],
    ['Dominar hashtags y algoritmos simplificados','DAGh2_NmaG8/J1qg3KXA1yVC6KjzfW-1EQ'],
    ['Comenta y conecta en Instagram','DAGh26tnY4w/Kz7SoGgmkcdsuKzfbFffWA'],
    ['Lanza y Crece: regalos estrategicos','DAGh25BxXzc/ubh9mzbg3PnhN-5T1XRnmg'],
    ['Transforma tu Bio e Historias Destacadas','DAGh24A4Y4w/QBWrEpmk6Z_wbvwNCqYKzw'],
    ['Impulsa tu Instagram conectando con tu audiencia','DAGh25NNZMI/Ljj08itD7dVLfTqHVZYL5g'],
    ['Guia Definitiva Para Ingresos Automatizados','DAGh4KPhDG0/EpVRcSB1vWKFLiZVIFBQCQ'],
  ];
  for (let i = 0; i < ts.length; i++) {
    const [title, id] = ts[i];
    const { error } = await s.from('items').insert({
      category_slug: 'plr-pro', title, description: 'Guia PLR - PARTE 2',
      link: 'https://www.canva.com/design/' + id + '/view',
      sort_order: 137 + i, active: 1, created_at: now, updated_at: now,
    });
    console.log(error ? 'ERR' : 'OK', title);
  }
  console.log('Total ~' + (137 + ts.length));
})();
