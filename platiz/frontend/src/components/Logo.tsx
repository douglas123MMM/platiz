type LogoProps = { size?: number; showText?: boolean; className?: string };

export function CrownIcon({ size = 40, className = '' }: { size?: number; className?: string }) {
  const s = Math.round(size * 2.2);
  return (
    <svg viewBox="0 0 640 640" width={s} height={s} className={className}>
      <defs>
        <linearGradient id="goldFav" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stop-color="#c98518"/>
          <stop offset="28%" stop-color="#ffd56a"/>
          <stop offset="52%" stop-color="#fff1a7"/>
          <stop offset="72%" stop-color="#e7a92c"/>
          <stop offset="100%" stop-color="#9a5d10"/>
        </linearGradient>
        <filter id="glowFav" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.5" flood-color="#ffd978" flood-opacity=".65"/>
          <feDropShadow dx="0" dy="2" stdDeviation="3.5" flood-color="#000" flood-opacity=".65"/>
        </filter>
      </defs>
      <g filter="url(#glowFav)" transform="translate(0, 60)">
        <path d="M219 150 C232 171 247 190 262 204 L275 159 C284 178 293 190 305 201 L320 117 L335 201 C347 190 356 178 365 159 L378 204 C393 190 408 171 421 150 L395 239 L245 239 Z" fill="url(#goldFav)" stroke="#d49324" stroke-width="3" stroke-linejoin="round"/>
        <path d="M249 249 H391 V263 H249 Z" fill="url(#goldFav)" stroke="#d49324" stroke-width="2"/>
      </g>
    </svg>
  );
}

export default function Logo({ size = 40, showText = true, className = '' }: LogoProps) {
  const w = Math.round(size * 5.2);
  const h = Math.round(size * 5.2);
  return (
    <svg viewBox="0 0 640 640" width={showText ? w : Math.round(size * 2.2)} height={showText ? h : Math.round(size * 2.2)} className={className}>
      <defs>
        <linearGradient id="goldMain" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stop-color="#c98518"/>
          <stop offset="28%" stop-color="#ffd56a"/>
          <stop offset="52%" stop-color="#fff1a7"/>
          <stop offset="72%" stop-color="#e7a92c"/>
          <stop offset="100%" stop-color="#9a5d10"/>
        </linearGradient>
        <linearGradient id="whiteText" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="58%" stop-color="#f4f4f4"/>
          <stop offset="100%" stop-color="#bfbfbf"/>
        </linearGradient>
        <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.2" flood-color="#ffffff" flood-opacity=".35"/>
          <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity=".65"/>
        </filter>
        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.5" flood-color="#ffd978" flood-opacity=".65"/>
          <feDropShadow dx="0" dy="2" stdDeviation="3.5" flood-color="#000000" flood-opacity=".65"/>
        </filter>
      </defs>
      <rect width="640" height="640" fill="transparent"/>
      <g filter="url(#glow)">
        <path d="M219 150 C232 171 247 190 262 204 L275 159 C284 178 293 190 305 201 L320 117 L335 201 C347 190 356 178 365 159 L378 204 C393 190 408 171 421 150 L395 239 L245 239 Z" fill="url(#goldMain)" stroke="#d49324" stroke-width="3" stroke-linejoin="round"/>
        <path d="M249 249 H391 V263 H249 Z" fill="url(#goldMain)" stroke="#d49324" stroke-width="2"/>
      </g>
      <g filter="url(#shadow)" font-family="Montserrat, Arial Black, sans-serif" font-weight="800" text-anchor="middle">
        <text x="320" y="365" font-size="78" letter-spacing="2" fill="url(#whiteText)" stroke="#e8e8e8" stroke-width="2">GLOBAL</text>
      </g>
      <g filter="url(#glow)" font-family="Montserrat, Arial Black, sans-serif" font-weight="800" text-anchor="middle">
        <text x="320" y="436" font-size="56" letter-spacing="1.5" fill="#111111" stroke="url(#goldMain)" stroke-width="7" paint-order="stroke fill">DORADO</text>
        <text x="320" y="436" font-size="56" letter-spacing="1.5" fill="#0a0a0a">DORADO</text>
      </g>
    </svg>
  );
}
