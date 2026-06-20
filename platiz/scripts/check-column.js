const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://vhgxevfrgnzbebffejnz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZ3hldmZyZ256YmViZmZlam56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDE5NDQwNywiZXhwIjoyMDk1NzcwNDA3fQ.0xGDQbV6OvqzZ_wdZpaaclxx_zwlAnM8tFvFv2epkhM',
  { auth: { persistSession: false } }
);

(async () => {
  try {
    const { data, error } = await supabase.from('store_products').select('purchase_instructions').limit(1);
    if (error) {
      if (error.message.includes('purchase_instructions')) {
        console.log('COLUMNA NO EXISTE - necesita crearse en SQL Editor');
      } else {
        console.log('Error API:', error.message);
      }
    } else {
      console.log('COLUMNA YA EXISTE - todo OK');
    }
  } catch(e) {
    console.log('Error red:', e.message);
  }
})();
