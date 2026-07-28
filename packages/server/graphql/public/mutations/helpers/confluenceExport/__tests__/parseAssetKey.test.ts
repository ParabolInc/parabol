import {CipherId} from '../../../../../../utils/CipherId'
import {parseAssetKey} from '../fetchAssetBuffer'

const ORIGIN = 'https://dev.parabol.co'
const pageId = 12345
const code = CipherId.encrypt(pageId)

describe('parseAssetKey', () => {
  it('accepts a well-formed app-origin Page asset URL and decrypts the owning pageId', () => {
    const parsed = parseAssetKey(`${ORIGIN}/assets/Page/${code}/assets/abc123.png`, ORIGIN)
    expect(parsed).toEqual({pageId, partialPath: `Page/${code}/assets/abc123.png`})
  })

  it('accepts origin-relative asset paths', () => {
    const parsed = parseAssetKey(`/assets/Page/${code}/assets/abc123.png`, ORIGIN)
    expect(parsed?.pageId).toBe(pageId)
  })

  it('rejects external hosts entirely', () => {
    expect(
      parseAssetKey(`https://evil.example.com/assets/Page/${code}/assets/x.png`, ORIGIN)
    ).toBeNull()
  })

  it('rejects traversal, backslashes, and absolute keys — raw or URL-encoded', () => {
    expect(
      parseAssetKey(`${ORIGIN}/assets/Page/${code}/assets/../../secret.png`, ORIGIN)
    ).toBeNull()
    expect(
      parseAssetKey(`${ORIGIN}/assets/Page/${code}/assets/%2e%2e%2fsecret.png`, ORIGIN)
    ).toBeNull()
    expect(parseAssetKey(`${ORIGIN}/assets/Page/${code}/assets/a%5Cb.png`, ORIGIN)).toBeNull()
    expect(parseAssetKey(`${ORIGIN}/assets//etc/passwd`, ORIGIN)).toBeNull()
  })

  it('rejects non-Page scopes and malformed keys', () => {
    expect(parseAssetKey(`${ORIGIN}/assets/User/123/assets/pic.png`, ORIGIN)).toBeNull()
    expect(parseAssetKey(`${ORIGIN}/assets/Organization/9/assets/logo.png`, ORIGIN)).toBeNull()
    expect(parseAssetKey(`${ORIGIN}/assets/Page/notanumber/assets/pic.png`, ORIGIN)).toBeNull()
    expect(parseAssetKey(`${ORIGIN}/assets/Page/${code}/picture/pic.png`, ORIGIN)).toBeNull()
    expect(parseAssetKey(`${ORIGIN}/assets/Page/${code}/assets/a/b.png`, ORIGIN)).toBeNull()
  })
})
