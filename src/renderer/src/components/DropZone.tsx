import { useState } from 'react'
import { FileEntry, CategoryConfig } from '../types'

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

interface DropZoneProps {
  files: FileEntry[]
  config: CategoryConfig
  onFilesAdded: (files: FileEntry[]) => void
  onRemove: (id: string) => void
  disabled?: boolean
}

export function DropZone({ files, config, onFilesAdded, onRemove, disabled }: DropZoneProps) {
  const [dragOver, setDragOver] = useState(false)

  function processNativeFiles(nativeFiles: FileList | null) {
    if (!nativeFiles) return
    const entries: FileEntry[] = []
    for (const f of nativeFiles) {
      const filePath: string = (f as any).path || f.name
      const ext = filePath.split('.').pop()?.toLowerCase() ?? ''
      if (config.acceptedExts.includes(ext)) {
        entries.push({
          id: crypto.randomUUID(),
          path: filePath,
          name: f.name,
          size: f.size,
          ext
        })
      }
    }
    if (entries.length > 0) onFilesAdded(entries)
  }

  async function openPicker() {
    const paths = await window.api.openFiles([config.fileFilter])
    if (!paths.length) return
    const entries: FileEntry[] = paths.map((p) => {
      const name = p.split(/[\\/]/).pop() ?? p
      const ext = name.split('.').pop()?.toLowerCase() ?? ''
      return { id: crypto.randomUUID(), path: p, name, size: 0, ext }
    })
    onFilesAdded(entries)
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        onClick={disabled ? undefined : openPicker}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          if (!disabled) processNativeFiles(e.dataTransfer.files)
        }}
        className={[
          'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer select-none',
          files.length > 0 ? 'py-5' : 'py-14',
          dragOver
            ? 'border-accent bg-accent/10 scale-[1.01]'
            : disabled
            ? 'border-border bg-surface-2 opacity-50 cursor-not-allowed'
            : 'border-border bg-surface-2 hover:border-accent/50 hover:bg-surface-3'
        ].join(' ')}
      >
        <div className="flex flex-col items-center gap-2 text-center pointer-events-none">
          <div className={['w-12 h-12 rounded-full flex items-center justify-center', dragOver ? 'bg-accent/20' : 'bg-surface-3'].join(' ')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={['w-6 h-6', dragOver ? 'text-accent' : 'text-slate-500'].join(' ')}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <p className="text-sm text-slate-400">
            {dragOver ? (
              <span className="text-accent font-medium">Thả file vào đây</span>
            ) : (
              <>
                <span className="text-slate-300 font-medium">Kéo thả file</span>
                <span className="text-slate-500"> hoặc click để chọn</span>
              </>
            )}
          </p>
          <p className="text-xs text-slate-600 uppercase tracking-wider">
            {config.acceptedExts.join(' · ')}
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="flex flex-col gap-1 max-h-44 overflow-y-auto pr-1">
          {files.map((f) => (
            <div key={f.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-2 border border-border group">
              <div className="w-7 h-7 rounded bg-surface-3 flex items-center justify-center shrink-0">
                <span className="text-[9px] font-bold text-accent uppercase">{f.ext}</span>
              </div>
              <span className="flex-1 text-sm text-slate-300 truncate" title={f.path}>{f.name}</span>
              {f.size > 0 && (
                <span className="text-xs text-slate-600 shrink-0">{formatSize(f.size)}</span>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(f.id) }}
                className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-error transition-all"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
