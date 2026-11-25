import type {JSONContent} from '@tiptap/core'
import type {DataLoaderInstance} from '../../../../../dataloader/RootDataLoader'
import type {TeamHealthMeeting} from '../../../../../postgres/types/Meeting'
import {getTeamHealthDiscussionBlocks} from '../getTeamHealthDiscussionBlocks'

const questions: Record<number, {question: string}> = {
  1: {question: 'Delivery'},
  2: {question: 'Support'},
  3: {question: 'Fun'}
}

const commentsByDiscussionId: Record<string, unknown[]> = {
  deliveryDiscussion: [],
  supportDiscussion: [
    {
      id: 'c1',
      createdBy: 'sally',
      createdAt: new Date('2026-11-24T12:00:00.000Z'),
      isActive: true,
      isAnonymous: false,
      plaintextContent: 'Rota works',
      threadParentId: null
    }
  ],
  funDiscussion: [
    {
      id: 'c2',
      createdBy: 'sally',
      createdAt: new Date('2026-11-24T12:00:00.000Z'),
      isActive: true,
      isAnonymous: true,
      plaintextContent: 'More games',
      threadParentId: null
    }
  ]
}

const makeMeeting = (stages: {questionId: number; discussionId: string; sortOrder: number}[]) =>
  ({phases: [{phaseType: 'TEAM_HEALTH_RESULT', stages}]}) as unknown as TeamHealthMeeting

const dataLoader = {
  get: (loaderName: string) => {
    if (loaderName === 'commentsByDiscussionId') {
      return {load: async (discussionId: string) => commentsByDiscussionId[discussionId]}
    }
    if (loaderName === 'users') {
      return {load: async () => ({preferredName: 'Sally'})}
    }
    if (loaderName === 'teamHealthQuestions') {
      return {load: async (questionId: number) => questions[questionId]}
    }
    throw new Error(`Unexpected loader ${loaderName}`)
  }
} as unknown as DataLoaderInstance

const questionTitles = (blocks: JSONContent[]) =>
  blocks.filter(({type}) => type === 'paragraph').map(({content}) => content?.[0]?.text)

test('lists the questions in the order the result stages are sorted, not the order they are stored', async () => {
  const meeting = makeMeeting([
    {questionId: 3, discussionId: 'funDiscussion', sortOrder: 1},
    {questionId: 1, discussionId: 'deliveryDiscussion', sortOrder: 2},
    {questionId: 2, discussionId: 'supportDiscussion', sortOrder: 0}
  ])

  const blocks = await getTeamHealthDiscussionBlocks(meeting, dataLoader)

  expect(blocks[0]).toMatchObject({
    type: 'heading',
    content: [{text: '2 Discussion Comments'}]
  })
  expect(questionTitles(blocks)).toEqual(['Support', 'Fun'])
})

test('adds nothing when no question has a comment', async () => {
  const meeting = makeMeeting([{questionId: 1, discussionId: 'deliveryDiscussion', sortOrder: 0}])

  expect(await getTeamHealthDiscussionBlocks(meeting, dataLoader)).toEqual([])
})
