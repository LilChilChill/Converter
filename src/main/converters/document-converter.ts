import mammoth from 'mammoth'
import { marked } from 'marked'
import TurndownService from 'turndown'
import fs from 'fs'
import path from 'path'

const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' })

async function docxToHtml(inputPath: string): Promise<string> {
  const result = await mammoth.convertToHtml({ path: inputPath })
  return result.value
}

async function docxToText(inputPath: string): Promise<string> {
  const result = await mammoth.extractRawText({ path: inputPath })
  return result.value
}

function htmlToMarkdown(html: string): string {
  return turndown.turndown(html)
}

function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function markdownToHtml(md: string): string {
  const result = marked(md)
  return typeof result === 'string' ? result : ''
}

function markdownToText(md: string): string {
  const html = markdownToHtml(md)
  return htmlToText(html)
}

function textToMarkdown(text: string): string {
  return text
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
}

export async function convertDocument(inputPath: string, outputPath: string): Promise<void> {
  const srcExt = path.extname(inputPath).toLowerCase().slice(1)
  const dstExt = path.extname(outputPath).toLowerCase().slice(1)

  let output = ''

  if (srcExt === 'docx') {
    if (dstExt === 'html') output = await docxToHtml(inputPath)
    else if (dstExt === 'md') output = htmlToMarkdown(await docxToHtml(inputPath))
    else if (dstExt === 'txt') output = await docxToText(inputPath)
  } else if (srcExt === 'md') {
    const content = fs.readFileSync(inputPath, 'utf-8')
    if (dstExt === 'html') output = markdownToHtml(content)
    else if (dstExt === 'txt') output = markdownToText(content)
  } else if (srcExt === 'html') {
    const content = fs.readFileSync(inputPath, 'utf-8')
    if (dstExt === 'md') output = htmlToMarkdown(content)
    else if (dstExt === 'txt') output = htmlToText(content)
  } else if (srcExt === 'txt') {
    const content = fs.readFileSync(inputPath, 'utf-8')
    if (dstExt === 'md') output = textToMarkdown(content)
  } else {
    throw new Error(`Unsupported document conversion: ${srcExt} → ${dstExt}`)
  }

  fs.writeFileSync(outputPath, output, 'utf-8')
}
