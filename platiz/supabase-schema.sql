-- ============================================================
-- PLATIZ - Supabase Schema
-- Pega esto en el SQL Editor de tu proyecto Supabase
-- ============================================================

-- USERS
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'client',
  status TEXT NOT NULL DEFAULT 'pending',
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CATEGORIES
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ITEMS
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_slug TEXT NOT NULL REFERENCES categories(slug),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link TEXT,
  sort_order INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BANNERS
CREATE TABLE banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link TEXT,
  active INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI PROVIDERS
CREATE TABLE ai_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  api_url TEXT NOT NULL,
  api_key TEXT,
  model TEXT,
  active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CHAT CONVERSATIONS
CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New Chat',
  provider_id UUID REFERENCES ai_providers(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CHAT MESSAGES
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES ai_providers(id),
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_items_category_slug ON items(category_slug);
CREATE INDEX idx_items_active ON items(active);
CREATE INDEX idx_banners_active ON banners(active);
CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX idx_chat_conversations_user ON chat_conversations(user_id);

-- ============================================================
-- CATEGORIES SEED
-- ============================================================
INSERT INTO categories (name, slug, icon, description) VALUES
  ('🎬 Entretenimiento', 'movies', '🎬', 'Streaming, música, gaming y bienestar: Netflix, Spotify, YouTube Premium y más'),
  ('📚 Capacitación', 'courses', '📚', 'Cursos de viralidad orgánica, estrategias de venta y cierre de alto impacto'),
  ('📖 Libros', 'books', '📖', 'Biblioteca digital con libros de desarrollo personal, negocios y crecimiento'),
  ('📱 Aplicaciones', 'apps', '📱', 'Apps móviles y web para potenciar tu productividad y negocio digital'),
  ('💬 Comunidad Telegram', 'telegram', '✈️', 'Canales VIP con soporte 24/7, actualizaciones y contenido exclusivo'),
  ('🛠️ Arsenal Digital', 'services', '🛠️', 'Licencias, software profesional e IAs: Office, Adobe, Solidworks, ChatGPT Plus y más'),
  ('🎓 Academia Global', 'academy', '🎓', 'El Método: capacitación maestra para operar tu negocio digital desde casa')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- ADMIN USER (password: admin123)
-- ============================================================
INSERT INTO users (username, email, password, role, status)
VALUES (
  'admin',
  'admin@platiz.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  'admin',
  'approved'
) ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- ITEMS SEED
-- ============================================================
INSERT INTO items (category_slug, title, description, sort_order) VALUES
  -- LIBROS
  ('books', '📖 El Método Global Dorado', 'Libro oficial del método: cómo operar tu negocio digital desde casa y transformar el internet en dinero.', 1),
  ('books', '📖 Hábitos Atómicos', 'Descubre cómo pequeños cambios generan resultados extraordinarios en tu vida y negocio.', 2),
  ('books', '📖 Padre Rico, Padre Pobre', 'Clásico de educación financiera que transformará tu forma de ver el dinero y las inversiones.', 3),
  ('books', '📖 El Club de las 5 de la Mañana', 'Domina tus mañanas para potenciar tu productividad y alcanzar tus metas.', 4),
  ('books', '📖 Cómo Ganar Amigos e Influir', 'Estrategias atemporales de relaciones interpersonales para el éxito en ventas.', 5),
  ('books', '📖 Piense y Hágase Rico', 'Los principios del éxito y la mentalidad de abundancia para crear riqueza.', 6),
  ('books', '📖 El Poder del Ahora', 'Guía espiritual para alcanzar la paz interior y el enfoque en el presente.', 7),
  ('books', '📖 La Semana Laboral de 4 Horas', 'Escapa del estilo de vida 9-5 y diseña tu libertad financiera.', 8),

  -- APLICACIONES
  ('apps', '📱 Canva Pro', 'Diseño gráfico profesional con plantillas premium para redes sociales y marketing.', 1),
  ('apps', '📱 CapCut Pro', 'Editor de video profesional con herramientas avanzadas de edición y efectos.', 2),
  ('apps', '📱 Gemini Advanced', 'IA de Google con capacidades multimodales y razonamiento avanzado.', 3),
  ('apps', '📱 Perplexity Pro', 'Buscador potenciado por IA con respuestas profundas y fuentes citadas.', 4),
  ('apps', '📱 Notion AI', 'Gestión de proyectos y documentación con asistencia de IA integrada.', 5),
  ('apps', '📱 Adobe Express Premium', 'Crea contenido para redes sociales, flyers y logos con facilidad.', 6),
  ('apps', '📱 Trello Premium', 'Gestión visual de proyectos con automatizaciones y calendarios.', 7),

  -- CAPACITACIÓN
  ('courses', '📚 Viralidad Orgánica en TikTok', 'Aprende los algoritmos para viralizar contenido sin gastar en publicidad.', 1),
  ('courses', '📚 Estrategias de Venta', 'Guiones, psicología y técnicas de cierre de alto impacto.', 2),
  ('courses', '📚 Instagram Reels Mastery', 'Domina los reels y atrae clientes en masa de forma orgánica.', 3),
  ('courses', '📚 YouTube Growth', 'Estrategias comprobadas para hacer crecer tu canal desde cero.', 4),

  -- TELEGRAM
  ('telegram', '✈️ Canal VIP Principal', 'Acceso al canal oficial con soporte 24/7 y contenido exclusivo para socios.', 1),
  ('telegram', '✈️ Canal de Ofertas', 'Notificaciones en tiempo real de nuevas licencias y promociones.', 2),
  ('telegram', '✈️ Grupo de Soporte', 'Comunidad activa donde resolver dudas y compartir experiencias.', 3),

  -- ARSENAL DIGITAL
  ('services', '🛠️ Office 365 Premium', 'Word, Excel, PowerPoint, Outlook y 1TB en OneDrive.', 1),
  ('services', '🛠️ Adobe Creative Cloud', 'Photoshop, Illustrator, Premiere Pro, After Effects y más.', 2),
  ('services', '🛠️ Solidworks 2024', 'Software CAD 3D líder en diseño industrial e ingeniería.', 3),
  ('services', '🛠️ AutoCAD 2025', 'Diseño asistido por computadora para planos y modelado 2D/3D.', 4),
  ('services', '🛠️ Windows 11 Pro', 'Sistema operativo profesional con todas las características.', 5),
  ('services', '🛠️ Netflix Premium 4K', 'Disfruta de películas y series en Ultra HD con sonido envolvente y 4 pantallas.', 6),
  ('services', '🛠️ Disney+ Premium', 'Acceso completo a Star, Marvel, Pixar, National Geographic y más.', 7),
  ('services', '🛠️ Spotify Premium', 'Música sin anuncios, descargas offline y sonido de alta calidad.', 8),
  ('services', '🛠️ YouTube Premium', 'Sin anuncios, reproducción en segundo plano y YouTube Music incluido.', 9),
  ('services', '🛠️ MAX (HBO Max)', 'Todo HBO, DC, Harry Potter y los mejores estrenos del cine.', 10),
  ('services', '🛠️ Crunchyroll Premium', 'Anime ilimitado sin anuncios, simulcast y acceso anticipado.', 11),

  -- ACADEMIA
  ('academy', '🎓 El Método - Módulo 1', 'Fundamentos del negocio digital: mentalidad, enfoque y acción.', 1),
  ('academy', '🎓 El Método - Módulo 2', 'Captación de clientes: embudos, tráfico orgánico y conversión.', 2),
  ('academy', '🎓 El Método - Módulo 3', 'Cierre de ventas: guiones, objeciones y técnicas avanzadas.', 3),
  ('academy', '🎓 El Método - Módulo 4', 'Escalado: automatización, delegación y crecimiento exponencial.', 4);
