import { Category, CATEGORIES } from '../types'

const ICONS: Record<Category, JSX.Element> = {
  data: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-6 h-6">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),
  document: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-6 h-6">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  image: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-6 h-6">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  media: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-6 h-6">
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" />
    </svg>
  )
}

interface SidebarProps {
  category: Category
  onChange: (cat: Category) => void
}

export function Sidebar({ category, onChange }: SidebarProps) {
  return (
    <aside className="w-16 flex flex-col items-center py-5 gap-2 bg-surface-1 border-r border-border shrink-0">
      <div className="mb-3 w-9 h-9 rounded-lg bg-accent flex items-center justify-center shadow-lg shadow-accent/30">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
          <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
      </div>

      <div className="w-full px-2 flex flex-col gap-1">
        {CATEGORIES.map((cat) => {
          const active = cat.id === category
          return (
            <button
              key={cat.id}
              onClick={() => onChange(cat.id)}
              title={cat.name}
              className={[
                'group relative w-full flex flex-col items-center justify-center py-3 rounded-lg transition-all duration-150',
                active
                  ? 'bg-accent/20 text-accent'
                  : 'text-slate-500 hover:bg-surface-3 hover:text-slate-300'
              ].join(' ')}
            >
              {ICONS[cat.id]}
              <span className="text-[9px] mt-1 font-medium tracking-wide">{cat.name}</span>
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-accent rounded-r" />
              )}
            </button>
          )
        })}
      </div>
    </aside>
  )
}
