import getVendorHost from '../getVendorHost'
import {getSlowBecause, getUnionMs} from '../vendorWait'

const intervals = (...pairs: [number, number][]) => pairs.map(([start, end]) => ({start, end}))

test.each([
  ['no requests', intervals(), 0],
  ['one request', intervals([100, 400]), 300],
  ['requests one after another', intervals([0, 100], [200, 500]), 400],
  ['overlapping requests, counted once', intervals([0, 300], [200, 500]), 500],
  ['a request inside another', intervals([0, 500], [100, 200]), 500],
  ['requests out of order', intervals([600, 700], [0, 300], [250, 400]), 500],
  ['requests that touch', intervals([0, 100], [100, 200]), 200]
])('vendor wait for %s', (_case, requests, expectedMs) => {
  expect(getUnionMs(requests)).toBe(expectedMs)
})

test.each([
  [0.4, 0, 'parabol'],
  [1, 1, 'parabol'],
  [3, 2.5, 'vendor'],
  [1.5, 0.5, 'vendor'],
  [1.5, 0.25, 'parabol'],
  [2.5, 0, 'parabol']
])(
  'an operation of %ss with %ss of vendor wait is slow because of %s',
  (duration, vendorWait, expected) => {
    expect(getSlowBecause(duration, vendorWait)).toBe(expected)
  }
)

test.each([
  ['api.atlassian.com', 'api.atlassian.com'],
  ['mysite.atlassian.net', 'atlassian.net'],
  ['parabol-assets.s3.us-east-1.amazonaws.com', 'amazonaws.com'],
  ['generativelanguage.googleapis.com', 'googleapis.com'],
  ['jira.customer.example', 'other'],
  ['tei-qwen3', null],
  ['valkey.parabol.local', null],
  ['10.4.0.12', null],
  ['[::1]', null],
  ['8.8.8.8', 'other']
])('%s is labeled %s', (hostname, expected) => {
  expect(getVendorHost(hostname)).toBe(expected)
})
