import { ipcMain, dialog, BrowserWindow } from 'electron'
import path from 'path'
import fs from 'fs'
import { convertData } from './converters/data-converter'
import { convertDocument } from './converters/document-converter'
import { convertImage } from './converters/image-converter'
import { convertMedia } from './converters/media-converter'

export interface ConvertRequest {
  category: 'data' | 'document' | 'image' | 'media'
  files: Array<{ id: string; path: string; name: string }>
  outputFormat: string
  outputDir: string
}

export function registerIpcHandlers(win: BrowserWindow): void {
  ipcMain.handle('dialog:openFiles', async (_, filters: Electron.FileFilter[]) => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openFile', 'multiSelections'],
      filters
    })
    return result.canceled ? [] : result.filePaths
  })

  ipcMain.handle('dialog:openDirectory', async () => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory', 'createDirectory']
    })
    return result.canceled ? null : result.filePaths[0]
  })

  ipcMain.handle('convert', async (_, req: ConvertRequest) => {
    const results: Array<{ id: string; outputPath: string; error?: string }> = []

    for (const file of req.files) {
      const outputName = path.basename(file.name, path.extname(file.name)) + '.' + req.outputFormat
      const outputPath = path.join(req.outputDir, outputName)

      try {
        win.webContents.send('convert:progress', { id: file.id, progress: 0, status: 'converting' })

        switch (req.category) {
          case 'data':
            await convertData(file.path, outputPath)
            break
          case 'document':
            await convertDocument(file.path, outputPath)
            break
          case 'image':
            await convertImage(file.path, outputPath)
            break
          case 'media':
            await convertMedia(file.path, outputPath, (pct) => {
              win.webContents.send('convert:progress', { id: file.id, progress: pct, status: 'converting' })
            })
            break
        }

        win.webContents.send('convert:progress', { id: file.id, progress: 100, status: 'done', outputPath })
        results.push({ id: file.id, outputPath })
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err)
        win.webContents.send('convert:progress', { id: file.id, progress: 0, status: 'error', error })
        results.push({ id: file.id, outputPath, error })
      }
    }

    return results
  })

  ipcMain.handle('shell:openPath', async (_, filePath: string) => {
    const { shell } = await import('electron')
    if (fs.existsSync(filePath)) {
      await shell.showItemInFolder(filePath)
    }
  })
}
