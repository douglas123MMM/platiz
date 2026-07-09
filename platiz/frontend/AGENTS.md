# Global Dorado — Proyecto Frontend

## Stack
- **Framework:** Vite + React 18 + TypeScript
- **Estilos:** Tailwind CSS 3 (custom gold/dark theme)
- **Animaciones:** Framer Motion
- **Router:** React Router v6
- **Deploy:** Vercel (`platiz.vercel.app`)
- **Backend API:** misma instancia Vercel (carpeta `api/`)

## Paleta de diseño (LUXURY DARK + GOLD)
- **Fondo principal:** `#0a0a0f` / `#050508`
- **Cards/glass:** `bg-white/[0.02]` + `border-white/[0.04]`
- **Acento dorado:** `#FFD700`, `#DAA520`, `#B8860B`
- **Gradientes gold:** `from-[#DAA520] via-[#FFD700] to-[#B8860B]`
- **Tipografía:** Inter (body), Bodoni Moda (headings display)
- **Clases clave:** `.glass`, `.card`, `.card-glow`, `.section-title`, `.gold-text`, `.badge-gold`
- **NO usar colores arcoiris por categoría** — mantener dark+gold consistente

## Archivos clave
- `src/App.tsx` — Router principal con rutas públicas y protegidas
- `src/pages/LandingPage.tsx` — Landing pública con navbar, scroll suave, FAQ, comunidad Telegram
- `src/pages/DashboardHome.tsx` — Inicio del panel: hero, acceso rápido, features, categorías, chat IA
- `src/pages/SectionPage.tsx` — Página genérica de sección (apps, cursos, libros, etc.) con filtros, badges, fallbacks
- `src/pages/Store.tsx` — Tienda digital con grid de productos, filtros, modal de compra, fallbacks elegantes
- `src/components/Layout.tsx` — Sidebar + header del panel autenticado
- `src/types/index.ts` — Interfaces: ContentItem (con platform, tag, featured), StoreProduct, User, etc.
- `src/styles/index.css` — Estilos base, animaciones, glass, badges, scrollbar gold
- `tailwind.config.js` — Colores gold, dark, cyan, purple; fuentes Inter + Bodoni Moda

## Rutas
- `/` — Landing pública
- `/dashboard` — Inicio panel
- `/store` — Tienda
- `/apps`, `/courses`, `/books`, `/movies`, `/telegram`, `/academy`, `/affiliate`, `/ia`, `/programas`, `/editables`, `/plr-pro` — Secciones de contenido
- `/admin/*` — Panel admin
- `/chat` — Chat IA

## Decisiones de diseño tomadas
1. **Sin arcoiris:** paleta unificada dark+gold. Nada de colores por categoría.
2. **Fallbacks sin imagen:** gradiente dark elegante + letra inicial gold/sutil + nombre categoría
3. **Botones:** gold sólido para primarios, glass con borde gold para secundarios
4. **Secciones:** navbar con ids, scroll suave, FAQ accordion
5. **Landing:** navbar sticky, video lazy-load, Telegram community section
6. **Sin "Arsenal Digital":** se eliminó del sidebar y rutas — todo unificado en Tienda

## Comandos
- `npm run build` — Build producción (tsc + vite)
- `npm run dev` — Dev server
- Deploy: `vercel --prod --yes` desde `dist/`

## Convenciones
- No usar `// comentarios` a menos que sean necesarios
- Placeholder "Buscar X..." dinámico por sección
- CTA contextual por sección ("Abrir app", "Usar IA", "Leer", etc.)
- Estados: loading (skeleton pulse), empty (icono + mensaje contextual), error
- Imports organizados: React → router → api → types → icons → componentes
