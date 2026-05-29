import { useMemo } from 'react'
import { FileEntry, CategoryConfig } from '../types'

interface FormatSelectorProps {
  files: FileEntry[]
  config: CategoryConfig
  value: string
  onChange: (fmt: string) => void
}

export function FormatSelector({ files, config, value, onChange }: FormatSelectorProps) {
  const sourceExts = useMemo(() => {
    const exts = new Set(files.map((f) => f.ext))
    return [...exts]
  }, [files])

  const targetFormats = useMemo(() => {
    if (sourceExts.length === 0) return []
    const sets = sourceExts.map((ext) => config.conversionMap[ext] ?? [])
    if (sets.length === 1) return sets[0]
    return sets.reduce((a, b) => a.filter((x) => b.includes(x)))
  }, [sourceExts, config])

  const hasFiles = files.length > 0
  const noTargets = hasFiles && targetFormats.length === 0

  return (
    <div className="flex-1 flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
        Định dạng đầu ra
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={!hasFiles || noTargets}
          className={[
            'w-full px-3 py-2.5 rounded-lg bg-surface-3 border text-sm appearance-none cursor-pointer',
            'focus:outline-none focus:ring-1 focus:ring-accent/50 transition-colors',
            !hasFiles || noTargets
              ? 'border-border text-slate-600 cursor-not-allowed'
              : value
              ? 'border-accent/50 text-slate-200'
              : 'border-border text-slate-400'
          ].join(' ')}
        >
          <option value="" disabled>
            {noTargets
              ? 'Không có định dạng tương thích'
              : !hasFiles
              ? 'Chọn file trước'
              : 'Chọn định dạng...'}
          </option>
          {targetFormats.map((fmt) => (
            <option key={fmt} value={fmt}>
              {fmt.toUpperCase()}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {hasFiles && sourceExts.length > 0 && (
        <p className="text-xs text-slate-600">
          Nguồn: {sourceExts.map((e) => e.toUpperCase()).join(', ')}
        </p>
      )}
    </div>
  )
}
