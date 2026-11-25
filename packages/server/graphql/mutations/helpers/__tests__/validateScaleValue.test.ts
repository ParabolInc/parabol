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

test('a value may keep the colour it has, even one outside the palette, in either letter case', () => {
  expect(validateColorValue('#5CA0E5', '#5CA0E5')).toBe(true)
  expect(validateColorValue('#5ca0e5', '#5CA0E5')).toBe(true)
})

test('a value may not change to another colour outside the palette', () => {
  expect(validateColorValue('#45E595', '#5CA0E5')).toBe(false)
  expect(validateColorValue('#DB70DB', '#5CA0E5')).toBe(true)
})
