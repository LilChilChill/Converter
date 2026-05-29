import Jimp from 'jimp'
import path from 'path'

const MIME_MAP: Record<string, string> = {
  jpg: Jimp.MIME_JPEG,
  jpeg: Jimp.MIME_JPEG,
  png: Jimp.MIME_PNG,
  bmp: Jimp.MIME_BMP,
  tiff: Jimp.MIME_TIFF,
  tif: Jimp.MIME_TIFF
}

export async function convertImage(inputPath: string, outputPath: string): Promise<void> {
  const dstExt = path.extname(outputPath).toLowerCase().slice(1)
  const mime = MIME_MAP[dstExt]
  if (!mime) throw new Error(`Unsupported image output format: ${dstExt}`)

  const image = await Jimp.read(inputPath)

  if (mime === Jimp.MIME_JPEG) {
    image.quality(95)
  }

  await image.writeAsync(outputPath)
}
