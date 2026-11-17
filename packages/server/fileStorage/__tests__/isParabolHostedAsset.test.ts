import {isParabolHostedAsset} from '../isParabolHostedAsset'

jest.mock('../../appOrigin', () => ({__esModule: true, default: 'https://parabol.test'}))

test.each([
  ['https://parabol.test/assets/Page/1/assets/og.png', true],
  ['/assets/Page/1/assets/og.png', true],
  [new URL('https://parabol.test/assets/Team/2/assets/a.avif'), true],
  ['https://parabol.test/self-hosted/Page/1/assets/og.png', false],
  ['https://parabol.test/assetsfoo/og.png', false],
  ['https://cdn.example/assets/Page/1/assets/og.png', false],
  ['http://parabol.test/assets/Page/1/assets/og.png', false],
  ['https://[bad', false]
])('%s is hosted: %s', (src, expected) => {
  expect(isParabolHostedAsset(src)).toBe(expected)
})
