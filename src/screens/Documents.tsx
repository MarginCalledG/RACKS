import { useState } from 'react'
import { BlackCat, GoldenDog, SpottedPup, TabbyCat } from '../components/win/Pets'

/**
 * "Super important documents". A folder of pets, filed exactly where an
 * offshore accountant would hide the thing he actually cares about.
 *
 * Behaves like a 90s file browser: list view, one selection, double-click to
 * open a viewer. The joke lands better when the mechanics are straight.
 */
const FILES = [
  { name: 'quarterly_projections.bmp', art: TabbyCat, caption: 'Mr. Whiskers, Chief Financial Officer' },
  { name: 'audit_response_FINAL.bmp', art: BlackCat, caption: 'Refuses to comment on the record' },
  { name: 'offshore_structure_v2.bmp', art: GoldenDog, caption: 'Good boy. Terrible with money' },
  { name: 'DO_NOT_OPEN.bmp', art: SpottedPup, caption: 'Opened it anyway' },
] as const

export function Documents() {
  const [selected, setSelected] = useState<string | null>(null)
  const [open, setOpen] = useState<string | null>(null)
  const current = FILES.find((f) => f.name === open)

  if (current) {
    const Art = current.art
    return (
      <div className="stack">
        <div className="sunken" style={{ padding: 18, display: 'grid', placeItems: 'center', background: '#fff' }}>
          <Art size={200} />
        </div>
        <p style={{ textAlign: 'center' }}>{current.caption}</p>
        <div className="btn-row">
          <button className="btn" onClick={() => setOpen(null)}>
            Back to folder
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="stack">
      <div className="filelist">
        {FILES.map((f) => {
          const Art = f.art
          return (
            <button
              key={f.name}
              className="icon fileicon"
              aria-pressed={selected === f.name}
              onPointerDown={() => setSelected(f.name)}
              onDoubleClick={() => setOpen(f.name)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setOpen(f.name)
              }}
            >
              <Art size={44} />
              <span>{f.name}</span>
            </button>
          )
        })}
      </div>
      <p className="muted">
        4 objects. Double-click to open. None of this is a financial document.
      </p>
    </div>
  )
}
