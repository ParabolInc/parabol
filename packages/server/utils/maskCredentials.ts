const CREDENTIAL_KEY =
  /password|passwd|secret|token|api[-_]?key|authorization|cookie|credential|private[-_]?key|^code$|^otp$/i
// names a credential without holding it, e.g. tokenId
const IDENTIFIER_KEY = /(?:Id|Ids|_id|_ids)$/
const MASK = '******'
const isCredentialKey = (key: string) => CREDENTIAL_KEY.test(key) && !IDENTIFIER_KEY.test(key)
const DATA_URL = /^data:[\w/+.-]+;base64,/
const MAX_INLINE_DATA_URL_LENGTH = 1024

const describeBinary = (byteLength: number) => `[binary ${byteLength} bytes]`

const maskValue = (value: unknown, ancestors: Set<object>): unknown => {
  if (typeof value === 'string') {
    return value.length > MAX_INLINE_DATA_URL_LENGTH && DATA_URL.test(value)
      ? `[data url ${value.length} chars]`
      : value
  }
  if (!value || typeof value !== 'object') return value
  if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) {
    return describeBinary(value.byteLength)
  }
  if (value instanceof Blob) return describeBinary(value.size)
  if (value instanceof Date) return value
  if (ancestors.has(value)) return '[circular]'
  ancestors.add(value)
  const masked = Array.isArray(value)
    ? value.map((item) => maskValue(item, ancestors))
    : Object.fromEntries(
        Object.entries(value).map(([key, item]) => [
          key,
          isCredentialKey(key) ? MASK : maskValue(item, ancestors)
        ])
      )
  ancestors.delete(value)
  return masked
}

export const maskCredentials = (value: unknown) => maskValue(value, new Set())
