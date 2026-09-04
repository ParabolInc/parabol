import nextUnansweredPromptId from '../nextUnansweredPromptId'

const prompts = [{id: 'a'}, {id: 'b'}, {id: 'c'}]

it('picks the first prompt when nothing is focused', () => {
  expect(nextUnansweredPromptId(prompts, new Set(), null)).toBe('a')
})

it('skips answered prompts after the focused one', () => {
  expect(nextUnansweredPromptId(prompts, new Set(['b']), 'a')).toBe('c')
})

it('skips answered prompts when nothing is focused', () => {
  expect(nextUnansweredPromptId(prompts, new Set(['a']), null)).toBe('b')
})

it('never goes backwards to an earlier unanswered prompt', () => {
  expect(nextUnansweredPromptId(prompts, new Set(['b', 'c']), 'a')).toBe('b')
})

it('returns null on the last prompt', () => {
  expect(nextUnansweredPromptId(prompts, new Set(), 'c')).toBe(null)
})

it('returns null when every prompt is answered and the last one is focused', () => {
  expect(nextUnansweredPromptId(prompts, new Set(['a', 'b', 'c']), 'c')).toBe(null)
})

it('returns null for a single prompt', () => {
  expect(nextUnansweredPromptId([{id: 'a'}], new Set(), 'a')).toBe(null)
})

it('starts from the top when the focused prompt is unknown', () => {
  expect(nextUnansweredPromptId(prompts, new Set(['a']), 'zz')).toBe('b')
})
