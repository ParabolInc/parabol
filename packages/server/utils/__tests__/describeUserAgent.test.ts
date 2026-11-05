import describeUserAgent from '../describeUserAgent'

test.each([
  [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
    {browser: 'Chrome 141', os: 'macOS'}
  ],
  [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.3537.57',
    {browser: 'Edge 141', os: 'Windows'}
  ],
  [
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1',
    {browser: 'Safari 18', os: 'iOS'}
  ],
  [
    'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0',
    {browser: 'Firefox 144', os: 'Linux'}
  ],
  [
    'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/28.0 Chrome/130.0.0.0 Mobile Safari/537.36',
    {browser: 'Samsung Internet 28', os: 'Android'}
  ],
  ['curl/8.7.1', {}]
])('%s', (userAgent, expected) => {
  expect(describeUserAgent(userAgent)).toEqual(expected)
})
