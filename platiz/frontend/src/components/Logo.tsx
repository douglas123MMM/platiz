import { useState, useEffect } from 'react';

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

let cachedLogo: string | null | undefined = undefined;

export default function Logo({ size = 40, showText = false, className = '' }: LogoProps) {
  const [customUrl, setCustomUrl] = useState<string | null>(cachedLogo === undefined ? null : cachedLogo);
  
  useEffect(() => {
    if (cachedLogo !== undefined) {
      setCustomUrl(cachedLogo);
      return;
    }
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        const url = data?.logo_url || null;
        cachedLogo = url;
        setCustomUrl(url);
      })
      .catch(() => { cachedLogo = null; });
  }, []);

  if (customUrl) {
    const imgSize = Math.round(size * 2.2);
    return <img src={customUrl} alt="Global Dorado" style={{ width: imgSize, height: 'auto', maxHeight: imgSize, objectFit: 'contain' }} className={className} />;
  }

  return null;
}
