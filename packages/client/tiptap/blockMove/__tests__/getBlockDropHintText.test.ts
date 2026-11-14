import {getBlockDropHintText} from '../getBlockDropHintText'

test('names the target page when the drop is allowed', () => {
  expect(getBlockDropHintText({title: 'Roadmap', refusal: null, count: 1})).toBe(
    'Move to the bottom of Roadmap'
  )
})

test('counts the blocks when several are dragged', () => {
  expect(getBlockDropHintText({title: 'Roadmap', refusal: null, count: 3})).toBe(
    'Move 3 blocks to the bottom of Roadmap'
  )
})

test('treats an unknown count as one block', () => {
  expect(getBlockDropHintText({title: 'Roadmap', refusal: null, count: null})).toBe(
    'Move to the bottom of Roadmap'
  )
})

test('shows the refusal when the drop is refused', () => {
  expect(
    getBlockDropHintText({title: 'Roadmap', refusal: 'You can only view Roadmap', count: 3})
  ).toBe('You can only view Roadmap')
})
