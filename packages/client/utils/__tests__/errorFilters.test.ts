import {isOldBrowserError} from '../errorFilters'

const toSorted = Object.getOwnPropertyDescriptor(Array.prototype, 'toSorted')!
const segmenter = Object.getOwnPropertyDescriptor(Intl, 'Segmenter')!

describe('in a browser without toSorted or Intl.Segmenter', () => {
  beforeAll(() => {
    Reflect.deleteProperty(Array.prototype, 'toSorted')
    Reflect.deleteProperty(Intl, 'Segmenter')
  })
  afterAll(() => {
    Object.defineProperty(Array.prototype, 'toSorted', toSorted)
    Object.defineProperty(Intl, 'Segmenter', segmenter)
  })

  test.each([
    ['Chrome & Firefox', 'a.toSorted is not a function'],
    ['an uncaught error event', 'Uncaught TypeError: a.toSorted is not a function'],
    [
      'Safari',
      "e.toSorted is not a function. (In 'e.toSorted((t,n)=>t-n)', 'e.toSorted' is undefined)"
    ],
    ['a missing constructor', 'Intl.Segmenter is not a constructor'],
    [
      'Safari, a missing constructor',
      "undefined is not a constructor (evaluating 'new Intl.Segmenter(t)')"
    ]
  ])('%s: the browser is too old', (_engine, message) => {
    expect(isOldBrowserError(new TypeError(message))).toBe(true)
  })

  test("a method the browser has isn't one it lacks", () => {
    expect(isOldBrowserError(new TypeError('a.findLast is not a function'))).toBe(false)
  })

  test("an app method of the same name isn't a built-in", () => {
    expect(isOldBrowserError(new TypeError('a.sortTeams is not a function'))).toBe(false)
  })
})

test('a modern browser calling toSorted on a non-array is a bug, not an old browser', () => {
  expect(isOldBrowserError(new TypeError('a.toSorted is not a function'))).toBe(false)
})
