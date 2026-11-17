import {getSidebarDuplicateLanding} from '../getSidebarDuplicateLanding'

const topLevelPrivate = {parentPageId: null, isPrivate: true}

test('a private top-level copy of a shared page landed by fallback', () => {
  expect(
    getSidebarDuplicateLanding({parentPageId: 'page:1', isPrivate: false}, topLevelPrivate)
  ).toBe('private')
})

test('a copy of a top-level private page stays next to it', () => {
  expect(getSidebarDuplicateLanding(topLevelPrivate, topLevelPrivate)).toBe('nextTo')
})

test('a copy that has a parent landed next to the original', () => {
  expect(
    getSidebarDuplicateLanding(
      {parentPageId: 'page:1', isPrivate: false},
      {parentPageId: 'page:1', isPrivate: false}
    )
  ).toBe('nextTo')
})
