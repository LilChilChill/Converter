import { parse as csvParse } from 'csv-parse/sync'
import { stringify as csvStringify } from 'csv-stringify/sync'
import { XMLParser, XMLBuilder } from 'fast-xml-parser'
import yaml from 'js-yaml'
import TOML from '@iarna/toml'
import fs from 'fs'
import path from 'path'

type AnyData = Record<string, unknown> | unknown[]

function readSource(inputPath: string): { ext: string; content: string } {
  const ext = path.extname(inputPath).toLowerCase().slice(1)
  const content = fs.readFileSync(inputPath, 'utf-8')
  return { ext, content }
}

function parseToJson(ext: string, content: string): AnyData {
  switch (ext) {
    case 'csv': {
      const records = csvParse(content, { columns: true, skip_empty_lines: true })
      return records as unknown[]
    }
    case 'json':
      return JSON.parse(content) as AnyData
    case 'xml': {
      const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })
      return parser.parse(content) as AnyData
    }
    case 'yaml':
    case 'yml':
      return yaml.load(content) as AnyData
    case 'toml':
      return TOML.parse(content) as unknown as AnyData
    default:
      throw new Error(`Unsupported source format: ${ext}`)
  }
}

function serializeFromJson(data: AnyData, targetExt: string): string {
  switch (targetExt) {
    case 'csv': {
      const rows = Array.isArray(data) ? data : [data]
      return csvStringify(rows as Record<string, unknown>[], { header: true })
    }
    case 'json':
      return JSON.stringify(data, null, 2)
    case 'xml': {
      const builder = new XMLBuilder({ ignoreAttributes: false, attributeNamePrefix: '@_', format: true })
      const wrapped = Array.isArray(data) ? { root: { item: data } } : data
      return builder.build(wrapped)
    }
    case 'yaml':
    case 'yml':
      return yaml.dump(data, { indent: 2 })
    case 'toml': {
      if (Array.isArray(data)) throw new Error('TOML does not support top-level arrays')
      return TOML.stringify(data as Record<string, unknown>)
    }
    default:
      throw new Error(`Unsupported target format: ${targetExt}`)
  }
}

export async function convertData(inputPath: string, outputPath: string): Promise<void> {
  const { ext, content } = readSource(inputPath)
  const targetExt = path.extname(outputPath).toLowerCase().slice(1)
  const data = parseToJson(ext, content)
  const result = serializeFromJson(data, targetExt)
  fs.writeFileSync(outputPath, result, 'utf-8')
}
