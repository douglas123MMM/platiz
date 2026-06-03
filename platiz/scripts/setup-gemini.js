(async () => {
  const { createClient } = require('@supabase/supabase-js');
  const s = createClient(
    'https://vhgxevfrgnzbebffejnz.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoZ3hldmZyZ256YmViZmZlam56Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDE5NDQwNywiZXhwIjoyMDk1NzcwNDA3fQ.0xGDQbV6OvqzZ_wdZpaaclxx_zwlAnM8tFvFv2epkhM',
    { auth: { persistSession: false } }
  );

  const prompt = "Eres el asistente de Global Dorado. Ayudas con precios y metodos de pago. Reglas: 1. Precios en USDT. Bolivares: multiplica por ~60 Bs/USD. 2. Pagos: Binance ID 355976674 (jcespinoza2011@gmail.com), pago movil 0102/04243057148/28012172. 3. WhatsApp +584149132366. 4. Streaming: Netflix 3-14, Disney+ 1.7-9.5, HBO 1.5-3, Prime 1.5-3, Crunchyroll 1.5-3, YouTube 3, Paramount 1.5-3, Vix 1.7-3, MagisTV 3-3.5, Apple TV 3. 5. IA: ChatGPT 4.5-10, Gemini 2.5-4.22, Perplexity 2.56-5, Grok 2-3, Jarvis 1.83-3.11, Gamma 4.22-22. 6. Creatividad: Canva Pro 1.5/ano, CapCut 2.5-4. 7. Musica: Spotify 3.5-8, Apple Music 3.11. 8. Educacion: Duolingo 1.72, Scribd 1.85. 9. VPN: Surfshark 2, Nord 2.88, Express 2.39. 10. Licencias software: consultar (hay +40 programas disponibles). 11. Responde breve, amable y en espanol. 12. Si preguntan por un producto especifico, solo da el precio de ese producto.";

  const { data: existing } = await s.from('ai_providers').select('id').eq('name', 'Gemini').maybeSingle();
  const { data: old } = await s.from('ai_providers').select('id,name').maybeSingle();
  console.log('Providers existentes:', JSON.stringify(old));

  if (existing) {
    await s.from('ai_providers').update({
      api_url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
          api_key: 'AQ.Ab8RN6Ls6F2orC2Ykib5ErW6Cc5TT7m40FZv8iNrJgYpTU21bA',
      model: 'gemini-2.0-flash',
      active: 1,
    }).eq('id', existing.id);
    console.log('OK: Gemini actualizado');
  } else if (old) {
    await s.from('ai_providers').update({
      name: 'Gemini',
      api_url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
          api_key: 'AQ.Ab8RN6Ls6F2orC2Ykib5ErW6Cc5TT7m40FZv8iNrJgYpTU21bA',
      model: 'gemini-2.0-flash',
      active: 1,
    }).eq('id', old.id);
    console.log('OK: Provider actualizado a Gemini');
  } else {
    const { error } = await s.from('ai_providers').insert({
      name: 'Gemini',
      api_url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
          api_key: 'AQ.Ab8RN6Ls6F2orC2Ykib5ErW6Cc5TT7m40FZv8iNrJgYpTU21bA',
      model: 'gemini-2.0-flash',
      active: 1,
    });
    console.log(error ? 'ERROR: ' + error.message : 'OK: Gemini creado y activo');
  }
})();
