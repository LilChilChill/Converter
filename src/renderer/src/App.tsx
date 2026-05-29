import { useState, useEffect, useCallback } from 'react'
import { Category, FileEntry, ResultEntry, getCategoryById } from './types'
import { Sidebar } from './components/Sidebar'
import { DropZone } from './components/DropZone'
import { FormatSelector } from './components/FormatSelector'
import { OutputDirSelector } from './components/OutputDirSelector'
import { ResultsList } from './components/ResultsList'

export function App() {
  const [category, setCategory] = useState<Category>('data')
  const [files, setFiles] = useState<FileEntry[]>([])
  const [outputFormat, setOutputFormat] = useState('')
  const [outputDir, setOutputDir] = useState('')
  const [results, setResults] = useState<ResultEntry[]>([])
  const [isConverting, setIsConverting] = useState(false)

  const config = getCategoryById(category)

  useEffect(() => {
    setFiles([])
    setOutputFormat('')
    setResults([])
  }, [category])

  useEffect(() => {
    setOutputFormat('')
  }, [files])

  const handleFilesAdded = useCallback((added: FileEntry[]) => {
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.path))
      return [...prev, ...added.filter((f) => !existing.has(f.path))]
    })
  }, [])

  const handleRemove = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const handleClear = useCallback(() => {
    setResults([])
  }, [])

  const canConvert = files.length > 0 && outputFormat !== '' && outputDir !== '' && !isConverting

  async function handleConvert() {
    if (!canConvert) return

    setIsConverting(true)
    const initialResults: ResultEntry[] = files.map((f) => ({
      id: f.id,
      inputName: f.name,
      status: 'pending',
      progress: 0
    }))
    setResults(initialResults)

    const unsubscribe = window.api.onProgress((event) => {
      setResults((prev) =>
        prev.map((r) =>
          r.id === event.id
            ? {
                ...r,
                status: event.status,
                progress: event.progress,
                outputPath: event.outputPath,
                error: event.error
              }
            : r
        )
      )
    })

    try {
      await window.api.convert({
        category,
        files: files.map((f) => ({ id: f.id, path: f.path, name: f.name })),
        outputFormat,
        outputDir
      })
    } finally {
      unsubscribe()
      setIsConverting(false)
    }
  }

  const doneCount = results.filter((r) => r.status === 'done').length
  const totalCount = results.length

  return (
    <div className="flex h-screen bg-surface-0 text-slate-200 overflow-hidden select-none">
      <Sidebar category={category} onChange={setCategory} />

      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Header */}
        <header className="px-6 py-4 border-b border-border shrink-0">
          <h1 className="text-base font-semibold text-slate-100">{config.name} Converter</h1>
          <p className="text-xs text-slate-500 mt-0.5">{config.description}</p>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          <DropZone
            files={files}
            config={config}
            onFilesAdded={handleFilesAdded}
            onRemove={handleRemove}
            disabled={isConverting}
          />

          <div className="flex gap-4">
            <FormatSelector
              files={files}
              config={config}
              value={outputFormat}
              onChange={setOutputFormat}
            />
            <OutputDirSelector value={outputDir} onChange={setOutputDir} />
          </div>

          <button
            onClick={handleConvert}
            disabled={!canConvert}
            className={[
              'w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200',
              canConvert
                ? 'bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/25 active:scale-[0.99]'
                : 'bg-surface-3 text-slate-600 cursor-not-allowed border border-border'
            ].join(' ')}
          >
            {isConverting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={2} strokeDasharray="31.4" strokeDashoffset="10" />
                </svg>
                Đang chuyển đổi... ({doneCount}/{totalCount})
              </span>
            ) : files.length === 0 ? (
              'Chọn file để bắt đầu'
            ) : !outputFormat ? (
              'Chọn định dạng đầu ra'
            ) : !outputDir ? (
              'Chọn thư mục lưu'
            ) : (
              `Chuyển đổi ${files.length} file → ${outputFormat.toUpperCase()}`
            )}
          </button>

          {results.length > 0 && (
            <ResultsList results={results} onClear={handleClear} />
          )}
        </div>
      </main>
    </div>
  )
}
