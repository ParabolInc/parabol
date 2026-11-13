import {PARABOL_AI_USER_ID} from '../constants'
import getDiscussionThreadCounts from '../getDiscussionThreadCounts'

const comment = (authorId: string | null = 'user1', isActive = true) => ({
  __typename: 'Comment',
  isActive,
  authorId
})
const aiComment = comment(PARABOL_AI_USER_ID)
const anonymousComment = comment(null)
const task = {__typename: 'Task'}
const poll = {__typename: 'Poll'}

test('an empty thread counts nothing and does not nudge', () => {
  expect(getDiscussionThreadCounts([])).toEqual({
    all: 0,
    tasks: 0,
    comments: 0,
    peopleComments: 0,
    isTaskNudge: false
  })
})

test('replies count, including tasks added as replies', () => {
  const counts = getDiscussionThreadCounts([
    {...comment(), replies: [comment(), task]},
    {...task, replies: [comment()]}
  ])
  expect(counts).toMatchObject({all: 5, tasks: 2, comments: 3})
})

test('a deleted comment does not count, but its replies do', () => {
  const counts = getDiscussionThreadCounts([
    {...comment('user1', false), replies: [comment(), task]}
  ])
  expect(counts).toMatchObject({all: 2, tasks: 1, comments: 1})
})

test('polls count toward All only', () => {
  expect(getDiscussionThreadCounts([poll, task])).toMatchObject({all: 2, tasks: 1, comments: 0})
})

test('three comments from people with no task nudge, replies and anonymous included', () => {
  const counts = getDiscussionThreadCounts([{...comment(), replies: [anonymousComment]}, comment()])
  expect(counts).toMatchObject({peopleComments: 3, isTaskNudge: true})
})

test('Parabol AI comments do not count toward the nudge', () => {
  const counts = getDiscussionThreadCounts([
    aiComment,
    comment(),
    {...comment(), replies: [aiComment]}
  ])
  expect(counts).toMatchObject({comments: 4, peopleComments: 2, isTaskNudge: false})
})

test('any task on the topic stops the nudge', () => {
  const counts = getDiscussionThreadCounts([comment(), comment(), {...comment(), replies: [task]}])
  expect(counts).toMatchObject({peopleComments: 3, isTaskNudge: false})
})

test('deleted comments do not count toward the nudge', () => {
  const counts = getDiscussionThreadCounts([comment(), comment(), comment('user2', false)])
  expect(counts).toMatchObject({peopleComments: 2, isTaskNudge: false})
})
