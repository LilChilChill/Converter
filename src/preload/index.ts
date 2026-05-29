import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

export type ProgressEvent = {
  id: string
  progress: number
  status: 'converting' | 'done' | 'error'
  outputPath?: string
  error?: string
}

const api = {
  openFiles: (filters: Electron.FileFilter[]): Promise<string[]> =>
    ipcRenderer.invoke('dialog:openFiles', filters),

  openDirectory: (): Promise<string | null> =>
    ipcRenderer.invoke('dialog:openDirectory'),

  convert: (req: {
    category: string
    files: Array<{ id: string; path: string; name: string }>
    outputFormat: string
    outputDir: string
  }) => ipcRenderer.invoke('convert', req),

  onProgress: (callback: (event: ProgressEvent) => void) => {
    const listener = (_: Electron.IpcRendererEvent, data: ProgressEvent) => callback(data)
    ipcRenderer.on('convert:progress', listener)
    return () => ipcRenderer.removeListener('convert:progress', listener)
  },

  openPath: (filePath: string): Promise<void> =>
    ipcRenderer.invoke('shell:openPath', filePath)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (e) {
    console.error(e)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}
