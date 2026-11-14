import makeTraceparent from '../makeTraceparent'

it('makes a sampled W3C traceparent with a fresh trace and span id', () => {
  const traceparent = makeTraceparent()
  expect(traceparent).toMatch(/^00-[0-9a-f]{32}-[0-9a-f]{16}-01$/)
  expect(makeTraceparent()).not.toBe(traceparent)
})
