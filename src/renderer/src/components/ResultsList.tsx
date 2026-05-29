import { ResultEntry } from '../types'

interface ResultsListProps {
  results: ResultEntry[]
  onClear: () => void
}

function StatusIcon({ status }: { status: ResultEntry['status'] }) {
  if (status === 'done') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4 text-success">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )
  }
  if (status === 'error') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4 text-error">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    )
  }
  if (status === 'converting') {
    return (
      <svg className="w-4 h-4 text-accent animate-spin" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={2} strokeDasharray="31.4" strokeDashoffset="10" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-slate-600">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

export function ResultsList({ results, onClear }: ResultsListProps) {
  const doneCount = results.filter((r) => r.status === 'done').length
  const errorCount = results.filter((r) => r.status === 'error').length

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium text-slate-300">Kết quả</h3>
          <span className="text-xs text-success">{doneCount} thành công</span>
          {errorCount > 0 && <span className="text-xs text-error">{errorCount} lỗi</span>}
        </div>
        <button
          onClick={onClear}
          className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
        >
          Xóa tất cả
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {results.map((r) => (
          <div
            key={r.id}
            className="flex flex-col gap-2 px-3 py-2.5 rounded-lg bg-surface-2 border border-border"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                <StatusIcon status={r.status} />
              </div>
              <span className="flex-1 text-sm text-slate-300 truncate" title={r.inputName}>
                {r.inputName}
              </span>
              {r.status === 'done' && r.outputPath && (
                <button
                  onClick={() => window.api.openPath(r.outputPath!)}
                  className="text-xs text-accent hover:text-accent-light transition-colors shrink-0"
                  title="Mở trong Explorer"
                >
                  Mở file
                </button>
              )}
            </div>

            {r.status === 'converting' && (
              <div className="ml-7">
                <div className="w-full h-1 bg-surface-3 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-300"
                    style={{ width: `${r.progress}%` }}
                  />
                </div>
              </div>
            )}

            {r.status === 'error' && r.error && (
              <p className="ml-7 text-xs text-error/80 truncate" title={r.error}>
                {r.error}
              </p>
            )}

            {r.status === 'done' && r.outputPath && (
              <p className="ml-7 text-xs text-slate-600 truncate" title={r.outputPath}>
                {r.outputPath}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
