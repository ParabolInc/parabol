import path from 'node:path'
import symbolicateClientStack from '../symbolicateClientStack'

// fixtures/clientBuild holds terser's map for this minified bundle, built from packages/client/components/TeamList.tsx:
// function e(e){return e.name.toUpperCase()}export function renderTeamList(n){return n.map(n=>e(n))}
const BUILD_DIR = path.join(__dirname, 'fixtures', 'clientBuild')
const BUNDLE_URL = 'https://action-files.parabol.co/production/build/app_0123abcd.js'
const MESSAGE = "Cannot read properties of undefined (reading 'toUpperCase')"

const symbolicate = (stack: string) =>
  symbolicateClientStack('TypeError', MESSAGE, stack, BUILD_DIR)

test('maps a minified Chrome stack to the original source', async () => {
  const chromeStack = [
    `TypeError: ${MESSAGE}`,
    `    at e (${BUNDLE_URL}:1:29)`,
    `    at ${BUNDLE_URL}:1:93`,
    '    at Array.map (<anonymous>)',
    `    at renderTeamList (${BUNDLE_URL}:1:86)`
  ].join('\n')
  expect((await symbolicate(chromeStack)).split('\n')).toEqual([
    `TypeError: ${MESSAGE}`,
    '    at toUpperCase (packages/client/components/TeamList.tsx:2:20)',
    '    at formatTeamName (packages/client/components/TeamList.tsx:6:30)',
    '    at map (packages/client/components/TeamList.tsx:6:16)'
  ])
})

test('maps a Firefox or Safari stack the same way', async () => {
  const firefoxStack = [`e@${BUNDLE_URL}:1:29`, `@${BUNDLE_URL}:1:93`].join('\n')
  expect((await symbolicate(firefoxStack)).split('\n')).toEqual([
    `TypeError: ${MESSAGE}`,
    '    at toUpperCase (packages/client/components/TeamList.tsx:2:20)',
    '    at formatTeamName (packages/client/components/TeamList.tsx:6:30)'
  ])
})

test('reads async, constructor and aliased frames without mistaking the message for one', async () => {
  const message = 'bad input in app.js:1:2'
  const chromeStack = [
    `TypeError: ${message}`,
    `    at async e (${BUNDLE_URL}:1:29)`,
    `    at new Widget (${BUNDLE_URL}:1:93)`,
    `    at Object.render [as render] (${BUNDLE_URL}:1:86)`
  ].join('\n')
  const stack = await symbolicateClientStack('TypeError', message, chromeStack, BUILD_DIR)
  expect(stack.split('\n')).toEqual([
    `TypeError: ${message}`,
    '    at toUpperCase (packages/client/components/TeamList.tsx:2:20)',
    '    at formatTeamName (packages/client/components/TeamList.tsx:6:30)',
    '    at map (packages/client/components/TeamList.tsx:6:16)'
  ])
})

test('leaves frames it has no map for as they are', async () => {
  const stack = [
    `TypeError: ${MESSAGE}`,
    '    at render (https://cdn.example.com/widget.js:1:29)',
    '    at load (https://action-files.parabol.co/production/build/..%2F..%2Fsecrets.js:1:1)',
    '    at missing (https://action-files.parabol.co/production/build/app_ffffffff.js:1:5)'
  ].join('\n')
  expect((await symbolicate(stack)).split('\n')).toEqual([
    `TypeError: ${MESSAGE}`,
    '    at render (https://cdn.example.com/widget.js:1:29)',
    '    at load (https://action-files.parabol.co/production/build/..%2F..%2Fsecrets.js:1:1)',
    '    at missing (https://action-files.parabol.co/production/build/app_ffffffff.js:1:5)'
  ])
})

test('keeps a stack it cannot parse', async () => {
  expect(await symbolicate('not a stack trace')).toBe('not a stack trace')
})
