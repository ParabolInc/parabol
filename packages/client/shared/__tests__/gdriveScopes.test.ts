import {GDRIVE_DOCS_SCOPE, GDRIVE_MEET_SCOPE, hasGdriveDocsScope} from '../gdriveScopes'

describe('hasGdriveDocsScope', () => {
  it('accepts space- or comma-separated scope strings containing the docs scope', () => {
    expect(hasGdriveDocsScope(`${GDRIVE_MEET_SCOPE} ${GDRIVE_DOCS_SCOPE}`)).toBe(true)
    expect(hasGdriveDocsScope(`${GDRIVE_MEET_SCOPE},${GDRIVE_DOCS_SCOPE}`)).toBe(true)
  })
  it('rejects meet-only, empty and missing scope strings', () => {
    expect(hasGdriveDocsScope(GDRIVE_MEET_SCOPE)).toBe(false)
    expect(hasGdriveDocsScope('')).toBe(false)
    expect(hasGdriveDocsScope(null)).toBe(false)
    expect(hasGdriveDocsScope(undefined)).toBe(false)
  })
})
