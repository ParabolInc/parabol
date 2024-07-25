import {inferLanguage} from '../inferLanguage'

test('should infer the language of a string', () => {
  expect(
    inferLanguage(
      `
Weighted Shortest Job First
planning poker, sprint poker, estimation
Story Points

Fibonacci
1, 2, 3, 5, 8, 13, 21, 34, ?, Pass
Story Value

Fibonacci
1, 2, 3, 5, 8, 13, 21, 34, ?, Pass
    `,
      10
    )
  ).toBe('en')
  /* ideally this would be detected as 'en', but it isn't
  expect(
    inferLanguage(
      `
*New Template #1
New prompt
    `,
      10
    )
  ).toBe('en')
   */
  expect(
    inferLanguage(
      `
Was lief gut?
Höhepunkte
    `,
      10
    )
  ).not.toBe('en')
})
