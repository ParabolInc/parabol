import {getDuplicateLanding} from '../getDuplicateLanding'

const topLevelPrivate = {parentPageId: null, isPrivate: true}

test('a private top-level copy of a shared page landed by fallback', () => {
  expect(getDuplicateLanding({parentPageId: 'page:1', isPrivate: false}, topLevelPrivate)).toBe(
    'private'
  )
})

test('a copy of a top-level private page stays next to it', () => {
  expect(getDuplicateLanding(topLevelPrivate, topLevelPrivate)).toBe('nextTo')
})

test('a copy that has a parent landed next to the original', () => {
  expect(
    getDuplicateLanding(
      {parentPageId: 'page:1', isPrivate: false},
      {parentPageId: 'page:1', isPrivate: false}
    )
  ).toBe('nextTo')
})
