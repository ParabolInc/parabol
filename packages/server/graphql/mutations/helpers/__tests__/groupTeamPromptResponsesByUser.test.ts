import type {JSONContent} from '@tiptap/core'
import groupTeamPromptResponsesByUser from '../groupTeamPromptResponsesByUser'

const makeDoc = (text: string): JSONContent => ({
  type: 'doc',
  content: [{type: 'paragraph', content: [{type: 'text', text}]}]
})

const whatIDid = {id: 'prompt-what', question: 'What did you do?'}
const blockers = {id: 'prompt-blockers', question: 'Any blockers?'}

test('groups answers by member in prompt order, heading each answer with its question', () => {
  const doneDoc = makeDoc('Wrote the grouping helper')
  const blockedDoc = makeDoc('Waiting on review')
  const responses = [
    {
      id: 1,
      userId: 'user-ada',
      promptId: blockers.id,
      content: blockedDoc,
      plaintextContent: 'Waiting on review',
      createdAt: new Date('2026-01-02T00:00:00.000Z')
    },
    {
      id: 3,
      userId: 'user-grace',
      promptId: whatIDid.id,
      content: makeDoc('Shipped the loader'),
      plaintextContent: 'Shipped the loader',
      createdAt: new Date('2026-01-03T00:00:00.000Z')
    },
    {
      id: 2,
      userId: 'user-ada',
      promptId: whatIDid.id,
      content: doneDoc,
      plaintextContent: 'Wrote the grouping helper',
      createdAt: new Date('2026-01-01T00:00:00.000Z')
    }
  ]

  const memberResponses = groupTeamPromptResponsesByUser([whatIDid, blockers], responses)

  expect(memberResponses).toHaveLength(2)
  const [ada, grace] = memberResponses
  expect(ada).toEqual({
    id: 2,
    userId: 'user-ada',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    content: {
      type: 'doc',
      content: [
        {type: 'heading', attrs: {level: 3}, content: [{type: 'text', text: 'What did you do?'}]},
        {type: 'paragraph', content: [{type: 'text', text: 'Wrote the grouping helper'}]},
        {type: 'heading', attrs: {level: 3}, content: [{type: 'text', text: 'Any blockers?'}]},
        {type: 'paragraph', content: [{type: 'text', text: 'Waiting on review'}]}
      ]
    },
    plaintextContent:
      'What did you do?\n\nWrote the grouping helper\n\nAny blockers?\n\nWaiting on review'
  })
  expect(grace?.userId).toBe('user-grace')
  expect(grace?.createdAt).toEqual(new Date('2026-01-03T00:00:00.000Z'))
})

test('a single-prompt stand-up composes nothing: the member content is the answer content', () => {
  const content = makeDoc('Shipped the loader')
  const memberResponses = groupTeamPromptResponsesByUser(
    [whatIDid],
    [
      {
        id: 2,
        userId: 'user-ada',
        promptId: whatIDid.id,
        content,
        plaintextContent: 'Shipped the loader',
        createdAt: new Date('2026-01-01T00:00:00.000Z')
      }
    ]
  )

  expect(memberResponses).toHaveLength(1)
  expect(memberResponses[0]!.content).toEqual(content)
  expect(JSON.stringify(memberResponses[0]!.content)).not.toContain('heading')
  expect(memberResponses[0]!.plaintextContent).toBe('Shipped the loader')
})

test('a single-prompt stand-up returns the stored row untouched, untrimmed text included', () => {
  const row = {
    id: 4,
    userId: 'user-ada',
    promptId: whatIDid.id,
    createdAt: new Date('2022-05-01T00:00:00.000Z'),
    content: {type: 'doc', content: [{type: 'paragraph'}, {type: 'notInTheSchemaAnymore'}]},
    plaintextContent: '\n\nShipped the parser'
  }
  const [memberResponse] = groupTeamPromptResponsesByUser([whatIDid], [row])
  expect(memberResponse).toEqual({
    id: row.id,
    userId: row.userId,
    createdAt: row.createdAt,
    content: row.content,
    plaintextContent: row.plaintextContent
  })
  expect(memberResponse?.content).toBe(row.content)
})
