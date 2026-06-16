export function CardBack({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dims = { sm: { w: 64, h: 104 }, md: { w: 100, h: 164 }, lg: { w: 140, h: 224 } }[size];

  return (
    <svg width={dims.w} height={dims.h} viewBox="0 0 64 104" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`bg-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1a0a2e" />
          <stop offset="50%" stopColor="#0f0720" />
          <stop offset="100%" stopColor="#1a0a2e" />
        </linearGradient>
        <linearGradient id={`border-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c9a227" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#e8c060" stopOpacity="1" />
          <stop offset="100%" stopColor="#c9a227" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      {/* Card background */}
      <rect width="64" height="104" rx="5" fill={`url(#bg-${size})`} />
      {/* Outer border */}
      <rect x="1.5" y="1.5" width="61" height="101" rx="4" fill="none" stroke={`url(#border-${size})`} strokeWidth="1" />
      {/* Inner border */}
      <rect x="5" y="5" width="54" height="94" rx="3" fill="none" stroke="#c9a227" strokeWidth="0.5" strokeOpacity="0.4" />
      {/* Corner ornaments */}
      <text x="8" y="16" fontSize="6" fill="#c9a227" fillOpacity="0.7" fontFamily="serif">✦</text>
      <text x="48" y="16" fontSize="6" fill="#c9a227" fillOpacity="0.7" fontFamily="serif">✦</text>
      <text x="8" y="100" fontSize="6" fill="#c9a227" fillOpacity="0.7" fontFamily="serif">✦</text>
      <text x="48" y="100" fontSize="6" fill="#c9a227" fillOpacity="0.7" fontFamily="serif">✦</text>
      {/* Central mandala */}
      <g transform="translate(32, 52)">
        {/* Outer ring */}
        <circle r="20" fill="none" stroke="#c9a227" strokeWidth="0.5" strokeOpacity="0.35" />
        <circle r="15" fill="none" stroke="#c9a227" strokeWidth="0.5" strokeOpacity="0.25" />
        <circle r="10" fill="none" stroke="#7c3aed" strokeWidth="0.5" strokeOpacity="0.4" />
        <circle r="5" fill="none" stroke="#c9a227" strokeWidth="0.7" strokeOpacity="0.5" />
        {/* Spokes */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
          <line
            key={angle}
            x1="0" y1="0"
            x2={Math.cos((angle * Math.PI) / 180) * 20}
            y2={Math.sin((angle * Math.PI) / 180) * 20}
            stroke="#c9a227" strokeWidth="0.3" strokeOpacity="0.3"
          />
        ))}
        {/* Center star */}
        <text x="-5" y="5" fontSize="10" fill="#c9a227" fillOpacity="0.8">✦</text>
      </g>
      {/* Top/bottom decorative lines */}
      <line x1="12" y1="20" x2="52" y2="20" stroke="#c9a227" strokeWidth="0.3" strokeOpacity="0.3" />
      <line x1="12" y1="84" x2="52" y2="84" stroke="#c9a227" strokeWidth="0.3" strokeOpacity="0.3" />
    </svg>
  );
}
