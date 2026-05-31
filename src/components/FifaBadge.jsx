export default function FifaBadge({ size = 52 }) {
  const h = Math.round(size * 72 / 86);
  return (
    <svg
      viewBox="0 0 86 72"
      width={size}
      height={h}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── "2" ── */}
      <text
        x="1" y="56"
        fontFamily="'Arial Black', Arial, sans-serif"
        fontSize="58" fontWeight="900"
        fill="#111"
      >2</text>

      {/* ── Trophy ── */}
      <g transform="translate(27,1)" fill="#111">
        {/* Cup body */}
        <path d="M4,0 L26,0 C29,0 32,3 32,10 C32,25 23,34 15,36 C7,34 -2,25 -2,10 C-2,3 1,0 4,0 Z"/>
        {/* Left handle */}
        <path d="M-2,5 C-8,5 -10,10 -10,15 C-10,20 -8,24 -2,24 L-2,21 C-6,21 -7,18 -7,15 C-7,12 -6,9 -2,9 Z"/>
        {/* Right handle */}
        <path d="M32,5 C38,5 40,10 40,15 C40,20 38,24 32,24 L32,21 C36,21 37,18 37,15 C37,12 36,9 32,9 Z"/>
        {/* Stem */}
        <rect x="12" y="36" width="6" height="12" rx="1"/>
        {/* Base */}
        <rect x="7" y="48" width="16" height="5" rx="1"/>
      </g>

      {/* ── "6" ── */}
      <text
        x="51" y="56"
        fontFamily="'Arial Black', Arial, sans-serif"
        fontSize="58" fontWeight="900"
        fill="#111"
      >6</text>

      {/* ── FIFA ── */}
      <text
        x="43" y="69"
        fontFamily="'Arial Black', Arial, sans-serif"
        fontSize="10" fontWeight="900"
        fill="#111"
        textAnchor="middle"
        letterSpacing="1.5"
      >FIFA</text>

      {/* ── ™ ── */}
      <text x="80" y="9" fontFamily="Arial, sans-serif" fontSize="7" fill="#111">™</text>
    </svg>
  );
}
