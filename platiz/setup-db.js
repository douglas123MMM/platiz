const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './backend/.env' });

async function main() {
  const pgHost = process.env.PG_HOST;
  const pgPass = process.env.PG_PASSWORD;
  if (!pgHost || !pgPass) {
    console.log('Set PG_HOST and PG_PASSWORD in backend/.env');
    process.exit(1);
  }
  const client = new Client({
    host: pgHost, port: 5432, database: 'postgres', user: 'postgres',
    password: pgPass, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10000,
  });

  try {
    await client.connect();
    console.log('Connected to Supabase PostgreSQL');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone TEXT,
        role TEXT DEFAULT 'client',
        status TEXT DEFAULT 'pending',
        avatar TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✓ users');

    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        icon TEXT,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✓ categories');

    await client.query(`
      CREATE TABLE IF NOT EXISTS items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        category_slug TEXT NOT NULL REFERENCES categories(slug),
        title TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        link TEXT,
        video_url TEXT,
        video_type TEXT,
        sort_order INTEGER DEFAULT 0,
        active INTEGER DEFAULT 1,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✓ items');

    await client.query(`
      CREATE TABLE IF NOT EXISTS streams (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        thumbnail_url TEXT,
        video_url TEXT NOT NULL,
        video_type TEXT,
        platform TEXT,
        active INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✓ streams');

    await client.query(`
      CREATE TABLE IF NOT EXISTS banners (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        link TEXT,
        active INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✓ banners');

    await client.query(`
      CREATE TABLE IF NOT EXISTS ai_providers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        api_url TEXT NOT NULL,
        api_key TEXT,
        model TEXT,
        active INTEGER DEFAULT 1,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✓ ai_providers');

    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT DEFAULT 'New Chat',
        provider_id UUID REFERENCES ai_providers(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✓ chat_conversations');

    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        provider_id UUID REFERENCES ai_providers(id),
        conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
        role TEXT DEFAULT 'user',
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('✓ chat_messages');

    // Seed categories
    await client.query(`
      INSERT INTO categories (name, slug, icon, description) VALUES
        ('Entretenimiento', 'movies', 'movie', 'Streaming, musica y gaming'),
        ('Capacitacion', 'courses', 'book', 'Cursos de viralidad y ventas'),
        ('Libros', 'books', 'book', 'Biblioteca digital'),
        ('Aplicaciones', 'apps', 'app', 'Apps para tu productividad'),
        ('Comunidad Telegram', 'telegram', 'telegram', 'Canales VIP'),
        ('Arsenal Digital', 'services', 'tools', 'Software y licencias'),
        ('Academia Global', 'academy', 'school', 'El Metodo')
      ON CONFLICT (slug) DO NOTHING
    `);
    console.log('✓ categories seeded');

    // Seed admin
    const hash = bcrypt.hashSync('admin123', 10);
    await client.query(
      'INSERT INTO users (username, email, password, role, status) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING',
      ['admin', 'admin@platiz.com', hash, 'admin', 'approved']
    );
    console.log('✓ admin user created');

    // Seed items
    await client.query(`
      INSERT INTO items (category_slug, title, description, sort_order) VALUES
        ('books', 'El Metodo Global Dorado', 'Libro oficial del metodo', 1),
        ('books', 'Habitos Atomicos', 'Peque�os cambios grandes resultados', 2),
        ('books', 'Padre Rico Padre Pobre', 'Educacion financiera', 3),
        ('apps', 'Canva Pro', 'Diseno grafico profesional', 1),
        ('apps', 'CapCut Pro', 'Editor de video profesional', 2),
        ('apps', 'Gemini Advanced', 'IA de Google', 3),
        ('courses', 'Viralidad Organica en TikTok', 'Aprende a viralizar sin publicidad', 1),
        ('courses', 'Estrategias de Venta', 'Gui�nes y tecnicas de cierre', 2),
        ('telegram', 'Canal VIP Principal', 'Soporte 24/7 y contenido exclusivo', 1),
        ('telegram', 'Canal de Ofertas', 'Notificaciones de promociones', 2),
        ('services', 'Office 365 Premium', 'Word, Excel, PowerPoint y 1TB', 1),
        ('services', 'Netflix Premium 4K', 'Peliculas y series en Ultra HD', 2),
        ('services', 'Adobe Creative Cloud', 'Photoshop, Premiere Pro y mas', 3),
        ('services', 'Spotify Premium', 'Musica sin anuncios', 4),
        ('academy', 'El Metodo - Modulo 1', 'Fundamentos del negocio digital', 1),
        ('academy', 'El Metodo - Modulo 2', 'Captacion de clientes', 2),
        ('academy', 'El Metodo - Modulo 3', 'Cierre de ventas', 3),
        ('academy', 'El Metodo - Modulo 4', 'Escalado y crecimiento', 4)
      ON CONFLICT DO NOTHING
    `);
    console.log('✓ items seeded');

    await client.end();
    console.log('\n✅ ALL DONE - Schema and seed complete!');
  } catch(e) {
    console.log('Error:', e.message);
    try { await client.end(); } catch {}
  }
}
main();
