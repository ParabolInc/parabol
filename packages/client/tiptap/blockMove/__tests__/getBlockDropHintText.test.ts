import {getBlockDropHintText} from '../getBlockDropHintText'

test('names the target page when the drop is allowed', () => {
  expect(getBlockDropHintText({title: 'Roadmap', refusal: null})).toBe(
    'Move to the bottom of Roadmap'
  )
})

test('shows the refusal when the drop is refused', () => {
  expect(getBlockDropHintText({title: 'Roadmap', refusal: 'You can only view Roadmap'})).toBe(
    'You can only view Roadmap'
  )
})
