export type Category = 'data' | 'document' | 'image' | 'media'

export interface FileEntry {
  id: string
  path: string
  name: string
  size: number
  ext: string
}

export interface ResultEntry {
  id: string
  inputName: string
  outputPath?: string
  status: 'pending' | 'converting' | 'done' | 'error'
  progress: number
  error?: string
}

export interface CategoryConfig {
  id: Category
  name: string
  description: string
  acceptedExts: string[]
  fileFilter: { name: string; extensions: string[] }
  conversionMap: Record<string, string[]>
}

export const CATEGORIES: CategoryConfig[] = [
  {
    id: 'data',
    name: 'Data',
    description: 'Chuyển đổi CSV, JSON, XML, YAML, TOML',
    acceptedExts: ['csv', 'json', 'xml', 'yaml', 'yml', 'toml'],
    fileFilter: { name: 'Data Files', extensions: ['csv', 'json', 'xml', 'yaml', 'yml', 'toml'] },
    conversionMap: {
      csv: ['json', 'xml', 'yaml'],
      json: ['csv', 'xml', 'yaml', 'toml'],
      xml: ['json', 'csv', 'yaml'],
      yaml: ['json', 'csv', 'xml', 'toml'],
      yml: ['json', 'csv', 'xml', 'toml'],
      toml: ['json', 'yaml']
    }
  },
  {
    id: 'document',
    name: 'Documents',
    description: 'Chuyển đổi DOCX, PDF, Markdown, HTML, TXT',
    acceptedExts: ['docx', 'pdf', 'md', 'html', 'htm', 'txt'],
    fileFilter: {
      name: 'Document Files',
      extensions: ['docx', 'pdf', 'md', 'html', 'htm', 'txt']
    },
    conversionMap: {
      docx: ['pdf', 'html', 'md', 'txt'],
      pdf:  ['txt', 'md', 'html'],
      md:   ['pdf', 'html', 'txt'],
      html: ['pdf', 'md', 'txt'],
      htm:  ['pdf', 'md', 'txt'],
      txt:  ['pdf', 'md', 'html']
    }
  },
  {
    id: 'image',
    name: 'Images',
    description: 'Chuyển đổi PNG, JPEG, BMP, TIFF',
    acceptedExts: ['png', 'jpg', 'jpeg', 'bmp', 'tiff', 'tif'],
    fileFilter: { name: 'Image Files', extensions: ['png', 'jpg', 'jpeg', 'bmp', 'tiff', 'tif'] },
    conversionMap: {
      png: ['jpg', 'bmp', 'tiff'],
      jpg: ['png', 'bmp', 'tiff'],
      jpeg: ['png', 'bmp', 'tiff'],
      bmp: ['png', 'jpg', 'tiff'],
      tiff: ['png', 'jpg', 'bmp'],
      tif: ['png', 'jpg', 'bmp']
    }
  },
  {
    id: 'media',
    name: 'Media',
    description: 'Chuyển đổi MP4, AVI, MKV, MP3, WAV, OGG, FLAC...',
    acceptedExts: ['mp4', 'avi', 'mkv', 'mov', 'mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'],
    fileFilter: {
      name: 'Media Files',
      extensions: ['mp4', 'avi', 'mkv', 'mov', 'webm', 'mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a']
    },
    conversionMap: {
      mp4: ['mp3', 'wav', 'avi', 'mkv', 'mov'],
      avi: ['mp4', 'mkv', 'mov', 'mp3', 'wav'],
      mkv: ['mp4', 'avi', 'mov', 'mp3', 'wav'],
      mov: ['mp4', 'avi', 'mkv', 'mp3', 'wav'],
      mp3: ['wav', 'ogg', 'aac', 'flac'],
      wav: ['mp3', 'ogg', 'aac', 'flac'],
      ogg: ['mp3', 'wav', 'aac'],
      aac: ['mp3', 'wav', 'ogg'],
      flac: ['mp3', 'wav', 'aac'],
      m4a: ['mp3', 'wav', 'ogg']
    }
  }
]

export function getCategoryById(id: Category): CategoryConfig {
  return CATEGORIES.find(c => c.id === id)!
}
