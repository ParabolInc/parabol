import {validateColorValue} from '../validateScaleValue'

test('every palette colour is accepted, in either letter case', () => {
  expect(validateColorValue('#DB70DB')).toBe(true)
  expect(validateColorValue('#db70db')).toBe(true)
  expect(validateColorValue('#fd6157')).toBe(true)
})

test('a colour outside the palette is refused', () => {
  expect(validateColorValue('#5CA0E5')).toBe(false)
  expect(validateColorValue('DB70DB')).toBe(false)
})
