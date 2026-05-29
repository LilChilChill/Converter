/// <reference types="vite/client" />

interface ProgressEvent {
  id: string
  progress: number
  status: 'converting' | 'done' | 'error'
  outputPath?: string
  error?: string
}

interface Window {
  api: {
    openFiles: (filters: { name: string; extensions: string[] }[]) => Promise<string[]>
    openDirectory: () => Promise<string | null>
    convert: (req: {
      category: string
      files: Array<{ id: string; path: string; name: string }>
      outputFormat: string
      outputDir: string
    }) => Promise<Array<{ id: string; outputPath: string; error?: string }>>
    onProgress: (callback: (event: ProgressEvent) => void) => () => void
    openPath: (filePath: string) => Promise<void>
  }
}
