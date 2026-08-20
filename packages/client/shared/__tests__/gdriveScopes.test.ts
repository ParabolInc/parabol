import {GDRIVE_MEET_SCOPE, GDRIVE_MEETINGS_SCOPE, hasGdriveMeetingsScope} from '../gdriveScopes'

describe('hasGdriveMeetingsScope', () => {
  it('accepts space- or comma-separated scope strings containing the meetings scope', () => {
    expect(hasGdriveMeetingsScope(`${GDRIVE_MEET_SCOPE} ${GDRIVE_MEETINGS_SCOPE}`)).toBe(true)
    expect(hasGdriveMeetingsScope(`${GDRIVE_MEET_SCOPE},${GDRIVE_MEETINGS_SCOPE}`)).toBe(true)
  })
  it('rejects meet-only, empty and missing scope strings', () => {
    expect(hasGdriveMeetingsScope(GDRIVE_MEET_SCOPE)).toBe(false)
    expect(hasGdriveMeetingsScope('')).toBe(false)
    expect(hasGdriveMeetingsScope(null)).toBe(false)
    expect(hasGdriveMeetingsScope(undefined)).toBe(false)
  })
})
