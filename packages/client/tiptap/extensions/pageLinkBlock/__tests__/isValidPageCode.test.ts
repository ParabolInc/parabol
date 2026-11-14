import {isValidPageCode} from '../isValidPageCode'

test.each([7, 1, 2 ** 31, 3982736365, 2 ** 32 - 1])('accepts the page code %p', (pageCode) => {
  expect(isValidPageCode(pageCode)).toBe(true)
})

test.each([NaN, 0, -3, 1.5, 2 ** 32, 99999999999, Infinity, '7', ''])(
  'rejects the page code %p',
  (pageCode) => {
    expect(isValidPageCode(pageCode)).toBe(false)
  }
)
