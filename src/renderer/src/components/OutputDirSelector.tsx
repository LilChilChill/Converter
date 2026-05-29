interface OutputDirSelectorProps {
  value: string
  onChange: (dir: string) => void
}

export function OutputDirSelector({ value, onChange }: OutputDirSelectorProps) {
  async function browse() {
    const dir = await window.api.openDirectory()
    if (dir) onChange(dir)
  }

  const displayPath = value
    ? value.length > 40
      ? '...' + value.slice(-38)
      : value
    : ''

  return (
    <div className="flex-1 flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
        Thư mục lưu
      </label>
      <button
        onClick={browse}
        className={[
          'w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm text-left transition-colors',
          'bg-surface-3 hover:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/50',
          value ? 'border-accent/40 text-slate-200' : 'border-border text-slate-500'
        ].join(' ')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-4 h-4 shrink-0 text-slate-500">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
        <span className="flex-1 truncate">{displayPath || 'Chọn thư mục đầu ra...'}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 shrink-0 text-slate-600">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
      {!value && (
        <p className="text-xs text-warn/70">Cần chọn thư mục để lưu kết quả</p>
      )}
    </div>
  )
}
