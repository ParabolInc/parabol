import {getUserAssetLocation} from '../getUserAssetLocation'

jest.mock('../../../../../appOrigin', () => ({__esModule: true, default: 'https://parabol.test'}))

const FILE = 'm7HwiUHkF2xV0oNjD8OLElUuquAtaXdZPEraSQlKvHw.avif'

test('finds the scope of each kind of upload from where it was stored', () => {
  expect(getUserAssetLocation(`https://parabol.test/assets/User/local|abc/assets/${FILE}`)).toEqual(
    {
      scope: 'User',
      scopeKey: 'local|abc',
      partialPath: `User/local|abc/assets/${FILE}`
    }
  )
  expect(getUserAssetLocation(`https://parabol.test/assets/Team/team_1-a/assets/${FILE}`)).toEqual({
    scope: 'Team',
    scopeKey: 'team_1-a',
    partialPath: `Team/team_1-a/assets/${FILE}`
  })
  expect(
    getUserAssetLocation('https://parabol.test/assets/Organization/org1/assets/a.png')
  ).toEqual({
    scope: 'Organization',
    scopeKey: 'org1',
    partialPath: 'Organization/org1/assets/a.png'
  })
  expect(getUserAssetLocation(`https://parabol.test/assets/Page/12345/assets/${FILE}`)).toEqual({
    scope: 'Page',
    scopeKey: 'page:12345',
    partialPath: `Page/12345/assets/${FILE}`
  })
})

test.each([
  ['another host', `https://evil.test/assets/User/u1/assets/${FILE}`],
  ['another port', `https://parabol.test:8443/assets/User/u1/assets/${FILE}`],
  ['plain http', `http://parabol.test/assets/User/u1/assets/${FILE}`],
  ['an upper-case host', `https://PARABOL.test/assets/User/u1/assets/${FILE}`],
  ['a user name', `https://me@parabol.test/assets/User/u1/assets/${FILE}`],
  ['a query', `https://parabol.test/assets/User/u1/assets/${FILE}?x=1`],
  ['an empty query', `https://parabol.test/assets/User/u1/assets/${FILE}?`],
  ['a fragment', `https://parabol.test/assets/User/u1/assets/${FILE}#x`],
  ['a dot-dot segment', `https://parabol.test/assets/Team/t1/../../User/u1/assets/${FILE}`],
  [
    'an encoded dot-dot',
    `https://parabol.test/assets/Team/t1/%2e%2e/%2e%2e/User/u1/assets/${FILE}`
  ],
  ['an encoded slash', `https://parabol.test/assets/User/u1%2Fassets/assets/${FILE}`],
  ['an encoded bar', `https://parabol.test/assets/User/local%7Cabc/assets/${FILE}`],
  ['a backslash', `https://parabol.test/assets\\User/u1/assets/${FILE}`],
  ['an extra segment', `https://parabol.test/assets/User/u1/assets/x/${FILE}`],
  ['a missing segment', `https://parabol.test/assets/User/assets/${FILE}`],
  ['another asset type', `https://parabol.test/assets/User/u1/picture/${FILE}`],
  ['an unknown scope', `https://parabol.test/assets/Meeting/m1/assets/${FILE}`],
  ['a filename with two dots', 'https://parabol.test/assets/User/u1/assets/a..png'],
  ['a filename without an extension', 'https://parabol.test/assets/User/u1/assets/abc'],
  ['the file store path', `https://parabol.test/self-hosted/User/u1/assets/${FILE}`],
  ['a page code with a leading zero', `https://parabol.test/assets/Page/012345/assets/${FILE}`],
  ['a page code that is not a number', `https://parabol.test/assets/Page/abc/assets/${FILE}`],
  ['a relative URL', `/assets/User/u1/assets/${FILE}`],
  ['not a URL', 'not a url']
])('refuses %s with BAD_USER_INPUT', (_label, url) => {
  expect(() => getUserAssetLocation(url)).toThrow(
    expect.objectContaining({extensions: {code: 'BAD_USER_INPUT'}})
  )
})
