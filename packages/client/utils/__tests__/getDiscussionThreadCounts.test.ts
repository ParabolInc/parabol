import getDiscussionThreadCounts from '../getDiscussionThreadCounts'

const comment = (isActive = true) => ({__typename: 'Comment', isActive})
const task = {__typename: 'Task'}
const poll = {__typename: 'Poll'}

test('an empty thread counts nothing', () => {
  expect(getDiscussionThreadCounts([])).toEqual({all: 0, tasks: 0, comments: 0})
})

test('replies count, including tasks added as replies', () => {
  const counts = getDiscussionThreadCounts([
    {...comment(), replies: [comment(), task]},
    {...task, replies: [comment()]}
  ])
  expect(counts).toEqual({all: 5, tasks: 2, comments: 3})
})

test('a deleted comment does not count, but its replies do', () => {
  const counts = getDiscussionThreadCounts([{...comment(false), replies: [comment(), task]}])
  expect(counts).toEqual({all: 2, tasks: 1, comments: 1})
})

test('polls count toward All only', () => {
  expect(getDiscussionThreadCounts([poll, task])).toEqual({all: 2, tasks: 1, comments: 0})
})
