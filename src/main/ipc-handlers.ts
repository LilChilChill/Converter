import { ipcMain, dialog, BrowserWindow, shell } from 'electron'
import path from 'path'
import fs from 'fs'
import { convertData } from './converters/data-converter'
import { convertDocument, documentToHtml } from './converters/document-converter'
import { convertImage } from './converters/image-converter'
import { convertMedia } from './converters/media-converter'

export interface ConvertRequest {
  category: 'data' | 'document' | 'image' | 'media'
  files: Array<{ id: string; path: string; name: string }>
  outputFormat: string
  outputDir: string
}

const PDF_PRINT_CSS = `
  body { font-family: Georgia, 'Times New Roman', serif; max-width: 680px; margin: 0 auto;
         padding: 48px 40px; line-height: 1.75; color: #1a1a1a; font-size: 13pt; }
  h1 { font-size: 2em; margin-top: 0; border-bottom: 2px solid #333; padding-bottom: 8px; }
  h2 { font-size: 1.5em; margin-top: 1.6em; } h3 { font-size: 1.2em; margin-top: 1.4em; }
  p  { margin: 0.8em 0; }
  code { background: #f2f2f2; padding: 1px 5px; border-radius: 3px; font-size: 0.88em;
         font-family: 'Courier New', monospace; }
  pre  { background: #f2f2f2; padding: 14px 16px; border-radius: 5px; overflow-x: auto;
         font-size: 0.85em; line-height: 1.5; }
  pre code { background: none; padding: 0; }
  blockquote { border-left: 4px solid #ccc; margin: 1em 0; padding: 4px 16px; color: #555; }
  table { border-collapse: collapse; width: 100%; margin: 1em 0; }
  td, th { border: 1px solid #ccc; padding: 6px 10px; }
  th { background: #f5f5f5; font-weight: 600; }
  img { max-width: 100%; height: auto; }
  a   { color: #2563eb; }
  ul, ol { margin: 0.6em 0; padding-left: 1.8em; }
  li { margin: 0.3em 0; }
`

async function renderHtmlToPdf(html: string, outputPath: string): Promise<void> {
  const fullHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>${PDF_PRINT_CSS}</style></head><body>${html}</body></html>`

  const hidden = new BrowserWindow({
    show: false,
    width: 900,
    height: 1200,
    webPreferences: { sandbox: false, javascript: false }
  })

  try {
    await hidden.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(fullHtml))
    const pdfBuffer = await hidden.webContents.printToPDF({
      printBackground: true,
      pageSize: 'A4',
      margins: { marginType: 'custom', top: 0.5, bottom: 0.5, left: 0.5, right: 0.5 }
    })
    fs.writeFileSync(outputPath, pdfBuffer)
  } finally {
    hidden.close()
  }
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

        if (req.category === 'document' && req.outputFormat === 'pdf') {
          win.webContents.send('convert:progress', { id: file.id, progress: 30, status: 'converting' })
          const html = await documentToHtml(file.path)
          win.webContents.send('convert:progress', { id: file.id, progress: 60, status: 'converting' })
          await renderHtmlToPdf(html, outputPath)
        } else {
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
    if (fs.existsSync(filePath)) {
      await shell.showItemInFolder(filePath)
    }
  })
}
