import {filetypeinfo} from 'magic-bytes.js'

const isSvgContent = (bytes: Uint8Array): boolean => {
  const text = new TextDecoder().decode(bytes)
  // Strip processing instructions (<?...?>) and DOCTYPE declarations (<!...>)
  const stripped = text
    .replace(/<\?[^>]*\?>/g, '')
    .replace(/<![\s\S]*?>/g, '')
    .trimStart()
  return /^<svg[\s>]/i.test(stripped)
}

/**
 * Returns an error message if declaredMime does not match detected mime
 */
export const checkFileMimeType = (bytes: Uint8Array, declaredMime: string): string | undefined => {
  const info = filetypeinfo(bytes)
  if (info.length === 0) return undefined // no magic bytes detected, trust the declared type

  let isMatch: boolean
  if (declaredMime.startsWith('text/')) {
    isMatch = info.some((i) => i.mime?.startsWith('text/plain'))
  } else if (declaredMime === 'image/svg+xml') {
    // svgs are often detected as xml, see https://github.com/LarsKoelpin/magic-bytes/issues/70
    isMatch =
      info.some((i) => i.mime === 'image/svg+xml') ||
      (info.some((i) => i.mime?.includes('xml')) && isSvgContent(bytes))
  } else {
    isMatch = info.some((i) => i.mime === declaredMime)
  }

  if (!isMatch) {
    const assumedType = info[0]?.typename ?? 'Unknown'
    return `Expected ${declaredMime} but received ${assumedType}. Is the file extension correct?`
  }
  return undefined
}
