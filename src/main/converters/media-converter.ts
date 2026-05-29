import ffmpeg from 'fluent-ffmpeg'
import ffmpegStatic from 'ffmpeg-static'
import path from 'path'

if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic)
}

const AUDIO_FORMATS = new Set(['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'])
const VIDEO_FORMATS = new Set(['mp4', 'avi', 'mkv', 'mov', 'webm', 'wmv'])

function getAudioCodec(ext: string): string {
  switch (ext) {
    case 'mp3': return 'libmp3lame'
    case 'wav': return 'pcm_s16le'
    case 'ogg': return 'libvorbis'
    case 'aac': return 'aac'
    case 'flac': return 'flac'
    case 'm4a': return 'aac'
    default: return 'copy'
  }
}

export async function convertMedia(
  inputPath: string,
  outputPath: string,
  onProgress?: (pct: number) => void
): Promise<void> {
  const dstExt = path.extname(outputPath).toLowerCase().slice(1)
  const srcExt = path.extname(inputPath).toLowerCase().slice(1)
  const isAudioOnly = AUDIO_FORMATS.has(srcExt) || AUDIO_FORMATS.has(dstExt)

  return new Promise((resolve, reject) => {
    let cmd = ffmpeg(inputPath)

    if (isAudioOnly && AUDIO_FORMATS.has(dstExt)) {
      cmd = cmd.audioCodec(getAudioCodec(dstExt)).noVideo()
    } else if (VIDEO_FORMATS.has(dstExt)) {
      cmd = cmd.videoCodec('libx264').audioCodec('aac')
    } else if (AUDIO_FORMATS.has(dstExt) && VIDEO_FORMATS.has(srcExt)) {
      cmd = cmd.audioCodec(getAudioCodec(dstExt)).noVideo()
    }

    cmd
      .output(outputPath)
      .on('progress', (info) => {
        if (onProgress && info.percent) onProgress(Math.min(99, info.percent))
      })
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run()
  })
}
