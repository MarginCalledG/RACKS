/**
 * Mascots. Flat shapes, heavy ink outlines, no gradients — drawn so they read
 * at 40px in a table row as well as at 140px on the mint card.
 *
 * The three ranks are deliberately escalating: Junior is small, sweating and
 * swamped by his suit; Senior is composed; Special is a wall of coat and hat.
 * The silhouette alone should tell you which one you drew, before the label
 * does — that's the point of putting them next to odds of 75/20/5.
 */

const INK = '#14110F'

type Props = { size?: number; className?: string }

function Frame({
  size = 96,
  className,
  label,
  children,
}: Props & { label: string; children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 100 120"
      width={size}
      height={(size * 120) / 100}
      className={className}
      role="img"
      aria-label={label}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <g
        stroke={INK}
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {children}
      </g>
    </svg>
  )
}

/** Junior — 75% of mints. Nervous, oversized suit, clipboard, visible sweat. */
export function JuniorAgent({ size, className }: Props) {
  return (
    <Frame size={size} className={className} label="Junior agent">
      <path d="M28 116 L28 78 Q28 66 40 63 L60 63 Q72 66 72 78 L72 116 Z" fill="#6E86C4" />
      <path d="M50 63 L42 82 L50 88 L58 82 Z" fill="#FFFFFF" />
      <path d="M50 88 L47 104 L50 108 L53 104 Z" fill="#E23B2E" />
      <circle cx="50" cy="36" r="23" fill="#FFD9A8" />
      <path d="M27 30 Q50 12 73 30 Q66 22 50 20 Q34 22 27 30 Z" fill="#8A5A2B" />
      <circle cx="41" cy="36" r="4.5" fill="#FFFFFF" />
      <circle cx="59" cy="36" r="4.5" fill="#FFFFFF" />
      <circle cx="41" cy="37" r="2" fill={INK} stroke="none" />
      <circle cx="59" cy="37" r="2" fill={INK} stroke="none" />
      <path d="M43 48 Q50 44 57 48" />
      <path d="M74 26 Q80 34 76 38 Q70 38 74 26 Z" fill="#7FD4F0" />
      <rect x="16" y="82" width="20" height="26" rx="3" fill="#F2C14E" />
      <path d="M20 90 H32 M20 96 H32 M20 102 H28" strokeWidth={2.5} />
    </Frame>
  )
}

/** Senior — 20%. Sunglasses, badge, arms folded. Knows what he's doing. */
export function SeniorAgent({ size, className }: Props) {
  return (
    <Frame size={size} className={className} label="Senior agent">
      <path d="M24 116 L24 76 Q24 63 38 60 L62 60 Q76 63 76 76 L76 116 Z" fill="#2C3E70" />
      <path d="M50 60 L41 80 L50 86 L59 80 Z" fill="#FFFFFF" />
      <path d="M50 86 L47 102 L50 106 L53 102 Z" fill="#1FA55C" />
      <circle cx="50" cy="34" r="23" fill="#E8B183" />
      <path d="M27 26 Q50 8 73 26 Q64 18 50 17 Q36 18 27 26 Z" fill={INK} />
      <path d="M30 33 H46 Q48 33 48 36 Q48 42 42 42 Q34 42 32 37 Z" fill={INK} />
      <path d="M52 33 H68 Q70 33 70 36 Q70 42 64 42 Q56 42 54 37 Z" fill={INK} />
      <path d="M48 35 H52" />
      <path d="M43 48 H57" />
      <circle cx="65" cy="76" r="7" fill="#F2B705" />
      <path d="M65 72 L66.5 75 L70 75.5 L67.5 78 L68 81 L65 79.5 L62 81 L62.5 78 L60 75.5 L63.5 75 Z" fill="#FFFFFF" strokeWidth={1.5} />
    </Frame>
  )
}

/** Special — 5%. Trench coat, hat brim over the eyes, briefcase. The jackpot. */
export function SpecialAgent({ size, className }: Props) {
  return (
    <Frame size={size} className={className} label="Special agent">
      <path d="M18 116 L20 74 Q22 58 38 55 L62 55 Q78 58 80 74 L82 116 Z" fill="#3B2E52" />
      <path d="M50 55 L40 78 L50 85 L60 78 Z" fill="#221A30" />
      <path d="M50 85 L47 104 L50 108 L53 104 Z" fill="#F2B705" />
      <circle cx="50" cy="34" r="22" fill="#D9A074" />
      <path d="M14 28 Q50 20 86 28 Q86 33 50 33 Q14 33 14 28 Z" fill={INK} />
      <path d="M31 28 Q31 8 50 8 Q69 8 69 28 Z" fill={INK} />
      <path d="M30 34 Q50 30 70 34 L70 40 Q50 37 30 40 Z" fill="#221A30" stroke="none" />
      <circle cx="41" cy="39" r="2.6" fill="#F2B705" stroke="none" />
      <circle cx="59" cy="39" r="2.6" fill="#F2B705" stroke="none" />
      <path d="M42 49 Q50 52 58 49" />
      <rect x="66" y="86" width="26" height="20" rx="3" fill="#8A5A2B" />
      <path d="M75 86 L75 81 H83 L83 86" strokeWidth={2.5} />
      <path d="M66 95 H92" strokeWidth={2.5} />
    </Frame>
  )
}

/** The melt, given a face. Sits next to the balance, dripping. */
export function MeltingCash({ size, className }: Props) {
  return (
    <Frame size={size} className={className} label="Melting stack of cash">
      <rect x="14" y="46" width="72" height="42" rx="4" fill="#4FBF7B" />
      <rect x="22" y="54" width="56" height="26" rx="3" fill="#8EE0AC" />
      <circle cx="38" cy="63" r="4" fill="#FFFFFF" />
      <circle cx="62" cy="63" r="4" fill="#FFFFFF" />
      <circle cx="38" cy="64" r="1.8" fill={INK} stroke="none" />
      <circle cx="62" cy="64" r="1.8" fill={INK} stroke="none" />
      <path d="M41 74 Q50 69 59 74" />
      <path d="M26 88 Q26 102 32 102 Q38 102 36 88 Z" fill="#4FBF7B" />
      <path d="M52 88 Q52 108 58 108 Q64 108 62 88 Z" fill="#4FBF7B" />
      <path d="M74 88 Q74 98 78 98 Q82 98 80 88 Z" fill="#4FBF7B" />
      <path d="M30 40 Q34 30 42 34" strokeWidth={3} />
      <path d="M58 34 Q66 30 70 40" strokeWidth={3} />
    </Frame>
  )
}

export function RankMascot({ rank, size, className }: Props & { rank: 0 | 1 | 2 }) {
  if (rank === 2) return <SpecialAgent size={size} className={className} />
  if (rank === 1) return <SeniorAgent size={size} className={className} />
  return <JuniorAgent size={size} className={className} />
}

/** Placeholder while VRF hasn't reported the rank yet. */
export function UnknownAgent({ size, className }: Props) {
  return (
    <Frame size={size} className={className} label="Agent, rank not yet revealed">
      <path d="M26 116 L26 76 Q26 62 40 59 L60 59 Q74 62 74 76 L74 116 Z" fill="#C9C4BC" />
      <circle cx="50" cy="35" r="23" fill="#E4DFD6" />
      <path d="M40 28 Q40 18 50 18 Q60 18 60 27 Q60 34 50 36 L50 42" strokeWidth={5} />
      <circle cx="50" cy="50" r="2.6" fill={INK} stroke="none" />
    </Frame>
  )
}
