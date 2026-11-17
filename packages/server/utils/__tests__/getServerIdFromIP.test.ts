import getServerIdFromIP from '../getServerIdFromIP'

test('uses the last 10 bits of the address', () => {
  expect(getServerIdFromIP('10.4.0.0')).toBe(0)
  expect(getServerIdFromIP('10.4.0.201')).toBe(201)
  expect(getServerIdFromIP('10.4.3.255')).toBe(1023)
  expect(getServerIdFromIP('10.4.7.201')).toBe(969)
})

test('ignores bits above the 10th so the id always fits a machine id', () => {
  expect(getServerIdFromIP('10.4.4.0')).toBe(0)
  expect(getServerIdFromIP('255.255.255.255')).toBe(1023)
})

test('rejects anything that is not an IPv4 address', () => {
  expect(() => getServerIdFromIP('')).toThrow()
  expect(() => getServerIdFromIP('10.4.7')).toThrow()
  expect(() => getServerIdFromIP('10.4.7.256')).toThrow()
  expect(() => getServerIdFromIP('fd00::1')).toThrow()
})
