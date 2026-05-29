import mammoth from 'mammoth'
import { marked } from 'marked'
import TurndownService from 'turndown'
import pdfParse from 'pdf-parse'
import fs from 'fs'
import path from 'path'

const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' })

// ── Readers ──────────────────────────────────────────────────────────────

async function docxToHtml(inputPath: string): Promise<string> {
  const result = await mammoth.convertToHtml({ path: inputPath })
  return result.value
}

async function docxToText(inputPath: string): Promise<string> {
  const result = await mammoth.extractRawText({ path: inputPath })
  return result.value
}

async function pdfToText(inputPath: string): Promise<string> {
  const buffer = fs.readFileSync(inputPath)
  const result = await pdfParse(buffer)
  return result.text
}

// ── Transformers ─────────────────────────────────────────────────────────

function htmlToMarkdown(html: string): string {
  return turndown.turndown(html)
}

function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<\/td>|<\/th>/gi, '\t')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function markdownToHtml(md: string): string {
  const result = marked(md)
  return typeof result === 'string' ? result : ''
}

function markdownToText(md: string): string {
  return htmlToText(markdownToHtml(md))
}

function textToMarkdown(text: string): string {
  return text
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
}

function textToHtml(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  const paragraphs = escaped
    .split(/\n\n+/)
    .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('\n')
  return paragraphs
}

// ── Public: get HTML from any source (used for → PDF path) ───────────────

export async function documentToHtml(inputPath: string): Promise<string> {
  const srcExt = path.extname(inputPath).toLowerCase().slice(1)
  const content = srcExt !== 'docx' && srcExt !== 'pdf'
    ? fs.readFileSync(inputPath, 'utf-8')
    : ''

  switch (srcExt) {
    case 'docx': return docxToHtml(inputPath)
    case 'pdf':  return `<pre>${await pdfToText(inputPath)}</pre>`
    case 'md':   return markdownToHtml(content)
    case 'html':
    case 'htm':  return content
    case 'txt':  return textToHtml(content)
    default: throw new Error(`Cannot convert ${srcExt} to HTML`)
  }
}

// ── Public: main conversion entry (non-PDF outputs) ──────────────────────

export async function convertDocument(inputPath: string, outputPath: string): Promise<void> {
  const srcExt = path.extname(inputPath).toLowerCase().slice(1)
  const dstExt = path.extname(outputPath).toLowerCase().slice(1)

  const textContent = srcExt !== 'docx' && srcExt !== 'pdf'
    ? fs.readFileSync(inputPath, 'utf-8')
    : ''

  let output = ''

  // ── DOCX source ──
  if (srcExt === 'docx') {
    if (dstExt === 'html')       output = await docxToHtml(inputPath)
    else if (dstExt === 'md')    output = htmlToMarkdown(await docxToHtml(inputPath))
    else if (dstExt === 'txt')   output = await docxToText(inputPath)

  // ── PDF source ──
  } else if (srcExt === 'pdf') {
    const rawText = await pdfToText(inputPath)
    if (dstExt === 'txt')        output = rawText
    else if (dstExt === 'md')    output = textToMarkdown(rawText)
    else if (dstExt === 'html')  output = textToHtml(rawText)

  // ── Markdown source ──
  } else if (srcExt === 'md') {
    if (dstExt === 'html')       output = markdownToHtml(textContent)
    else if (dstExt === 'txt')   output = markdownToText(textContent)

  // ── HTML source ──
  } else if (srcExt === 'html' || srcExt === 'htm') {
    if (dstExt === 'md')         output = htmlToMarkdown(textContent)
    else if (dstExt === 'txt')   output = htmlToText(textContent)

  // ── TXT source ──
  } else if (srcExt === 'txt') {
    if (dstExt === 'md')         output = textToMarkdown(textContent)
    else if (dstExt === 'html')  output = textToHtml(textContent)

  } else {
    throw new Error(`Unsupported document conversion: ${srcExt} → ${dstExt}`)
  }

  if (!output && output !== '') {
    throw new Error(`No handler for ${srcExt} → ${dstExt}`)
  }

  fs.writeFileSync(outputPath, output, 'utf-8')
}
