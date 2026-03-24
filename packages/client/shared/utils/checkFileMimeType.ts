import {filetypeinfo} from 'magic-bytes.js'

/**
 * Returns true if the bytes contain an SVG document.
 * Skips <?xml …?> and <!DOCTYPE …> preambles, then checks that the first real
 * opening tag is <svg (case-insensitive).
 */
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
 * Checks that the file bytes match the declared MIME type.
 * Returns an error message if they do not, or undefined if the check passes.
 *
 * Special cases:
 * - text/* subtypes cannot be distinguished from magic bytes → accept any text/plain match
 * - image/svg+xml detected as xml by magic-bytes → verify first real tag is <svg
 */
export const checkFileMimeType = (bytes: Uint8Array, declaredMime: string): string | undefined => {
  const info = filetypeinfo(bytes)
  if (info.length === 0) return undefined // no magic bytes detected, trust the declared type

  let isMatch: boolean
  if (declaredMime.startsWith('text/')) {
    isMatch = info.some((i) => i.mime?.startsWith('text/plain'))
  } else if (declaredMime === 'image/svg+xml') {
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
