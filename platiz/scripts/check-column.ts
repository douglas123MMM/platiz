import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://vhgxevfrgnzbebffejnz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZ3hldmZyZ256YmViZmZlam56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDE5NDQwNywiZXhwIjoyMDk1NzcwNDA3fQ.0xGDQbV6OvqzZ_wdZpaaclxx_zwlAnM8tFvFv2epkhM',
  { auth: { persistSession: false } }
);

async function run() {
  // Verificar si la columna ya existe
  const { data, error } = await supabase
    .from('store_products')
    .select('id')
    .limit(1);

  if (error) {
    console.log('Error conectando:', error.message);
    return;
  }

  // Intentar insertar un registro con la columna para ver si existe
  const testId = '00000000-0000-0000-0000-000000000000';
  const { error: testErr } = await supabase
    .from('store_products')
    .insert({ id: testId, title: '_test_rls_', price: 0, purchase_instructions: '' })
    .select();

  if (testErr) {
    if (testErr.message.includes('purchase_instructions')) {
      console.log('Columna purchase_instructions NO existe - necesita crearse manualmente en SQL Editor');
    } else {
      console.log('Columna purchase_instructions YA EXISTE (error esperado por otro motivo)');
    }
  } else {
    console.log('Columna purchase_instructions YA EXISTE');
  }

  // Limpiar test
  await supabase.from('store_products').delete().eq('id', testId);
  console.log('Listo.');
}

run();
