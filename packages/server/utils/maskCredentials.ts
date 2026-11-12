const CREDENTIAL_WORDS =
  'password|passwd|secret|token|api[-_]?key|authorization|cookie|credential|private[-_]?key|samlresponse|verifier'
const CREDENTIAL_KEY = new RegExp(`${CREDENTIAL_WORDS}|^otp$`, 'i')
// "key": "value", key=value and Authorization: Bearer value, in text that may be cut off mid-way
const CREDENTIAL_PAIR = new RegExp(
  `(["']?[\\w-]*(?:${CREDENTIAL_WORDS})[\\w-]*["']?\\s*[:=]\\s*)(?:(?:Bearer|Basic)\\s+)?("[^"]*"?|'[^']*'?|[^\\s&,;}"']+)`,
  'gi'
)
// loginSAML takes the IdP's whole form post as one string, and its SAMLResponse is a signed assertion anyone could replay
const SAML_RESPONSE_PARAM = /(SAMLResponse=)[^&]*/g
// names a credential without holding it, e.g. tokenId
const IDENTIFIER_KEY = /(?:Id|Ids|_id|_ids)$/
const MASK = '******'
const isCredentialKey = (key: string) => CREDENTIAL_KEY.test(key) && !IDENTIFIER_KEY.test(key)
const DATA_URL = /^data:[\w/+.-]+;base64,/
const MAX_INLINE_DATA_URL_LENGTH = 1024

const describeBinary = (byteLength: number) => `[binary ${byteLength} bytes]`

const maskValue = (value: unknown, ancestors: Set<object>): unknown => {
  if (typeof value === 'string') {
    if (value.length > MAX_INLINE_DATA_URL_LENGTH && DATA_URL.test(value)) {
      return `[data url ${value.length} chars]`
    }
    return value.includes('SAMLResponse=') ? value.replace(SAML_RESPONSE_PARAM, `$1${MASK}`) : value
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

export const maskCredentialText = (text: string) =>
  text.replace(CREDENTIAL_PAIR, `$1${MASK}`).replace(SAML_RESPONSE_PARAM, `$1${MASK}`)
