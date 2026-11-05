import {countShadeRanges, heatClassName} from '../reportHeatmapShades'

test('each shade names the counts it covers', () => {
  expect(countShadeRanges(3).map(({label}) => label)).toEqual(['1', '2', '3'])
  expect(countShadeRanges(12).map(({label}) => label)).toEqual(['1–4', '5–8', '9+'])
  expect(countShadeRanges(1).map(({label}) => label)).toEqual(['1'])
})

test('a health score is shaded by the answer it rounds to, whatever the biggest value', () => {
  expect(heatClassName('score', 3.5, 0)).toBe(heatClassName('score', 4.4, 100))
  expect(heatClassName('score', 3.4, 0)).not.toBe(heatClassName('score', 3.5, 0))
  expect(heatClassName('score', 2.4, 0)).not.toBe(heatClassName('score', 2.5, 0))
  expect(heatClassName('score', 4.4, 0)).not.toBe(heatClassName('score', 4.5, 0))
})
