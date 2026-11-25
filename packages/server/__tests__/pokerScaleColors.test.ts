import palettePickerOptions from '../../client/styles/palettePickerOptions'
import {sendPublic, signUp} from './common'
import {createPersonalAccessToken} from './mcpClient'

const POKER_SCALE_COLORS = `
  query PokerScaleColors {
    pokerScaleColors {
      name
      hex
    }
  }
`

test('a signed-in user lists the colors a poker scale value may use', async () => {
  const {cookie} = await signUp()
  const res = await sendPublic({query: POKER_SCALE_COLORS, cookie})
  expect(res.errors).toBeUndefined()
  expect(res.data.pokerScaleColors).toHaveLength(12)
  expect(res.data.pokerScaleColors).toEqual(palettePickerOptions)
  for (const {hex} of res.data.pokerScaleColors) {
    expect(hex).toMatch(/^#[0-9A-F]{6}$/)
  }
})

test('a request without a session or token is refused', async () => {
  const res = await sendPublic({query: POKER_SCALE_COLORS})
  expect(res.data).toBeNull()
  expect(res.errors?.[0]?.extensions?.code).toBe('UNAUTHENTICATED')
})

test('a PAT needs templates:read to list the poker scale colors', async () => {
  const {cookie} = await signUp()

  const withoutScope = await createPersonalAccessToken(['USERS_READ'], {cookie})
  const denied = await sendPublic({query: POKER_SCALE_COLORS, bearerToken: withoutScope})
  expect(denied.errors?.[0]?.message).toBe('Access token is missing required scope: templates:read')
  expect(denied.errors?.[0]?.extensions?.code).toBe('FORBIDDEN')

  const withScope = await createPersonalAccessToken(['USERS_READ', 'TEMPLATES_READ'], {cookie})
  const allowed = await sendPublic({query: POKER_SCALE_COLORS, bearerToken: withScope})
  expect(allowed.errors).toBeUndefined()
  expect(allowed.data.pokerScaleColors).toEqual(palettePickerOptions)
})
