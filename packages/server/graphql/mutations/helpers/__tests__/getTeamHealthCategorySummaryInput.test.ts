import type {PriorTeamHealthCycle} from '../../../../dataloader/customLoaderMakers'
import type {TeamHealthResponse} from '../../../../postgres/types'
import getTeamHealthCategorySummaryInput from '../getTeamHealthCategorySummaryInput'

const category = {id: 7, name: 'Psychological Safety'}
const question = 'If I make a mistake on this team, it is not held against me.'

let nextResponseId = 1
const makeResponse = (overrides: Partial<TeamHealthResponse>): TeamHealthResponse => ({
  id: nextResponseId++,
  meetingId: 'meeting-1',
  questionId: 11,
  userId: `user-${nextResponseId}`,
  score: 4,
  comment: null,
  commentParaphrased: null,
  isAnonymous: false,
  createdAt: new Date('2026-10-01'),
  updatedAt: new Date('2026-10-01'),
  ...overrides
})

const makePriorCycle = (
  score: number | null,
  comments: string[],
  priorQuestion = 'I can raise problems and tough issues with this team.'
): PriorTeamHealthCycle => ({
  meetingId: 'meeting-0',
  endedAt: new Date('2026-09-17'),
  scoreByCategoryId: new Map(score === null ? [] : [[category.id, score]]),
  commentsByCategoryId: new Map([[category.id, comments]]),
  questionByCategoryId: new Map([[category.id, priorQuestion]])
})

const scored = (...scores: number[]) => scores.map((score) => makeResponse({score}))

describe('getTeamHealthCategorySummaryInput', () => {
  it('summarizes nothing when fewer than 3 people scored the question', () => {
    const responses = [
      ...scored(5, 4),
      makeResponse({score: null, comment: 'No score, just a comment'}),
      makeResponse({score: null, comment: 'Another comment without a score'})
    ]
    expect(
      getTeamHealthCategorySummaryInput({category, question, responses, priorCycles: []})
    ).toBe(null)
  })

  it('leaves the spread out until 4 people have scored', () => {
    const input = getTeamHealthCategorySummaryInput({
      category,
      question,
      responses: scored(5, 4, 2),
      priorCycles: []
    })
    expect(input?.current).toEqual({
      average: 3.7,
      respondentCount: 3,
      answerCounts: null,
      comments: []
    })
  })

  it('counts each answer from 1 to 5 once 4 people have scored', () => {
    const input = getTeamHealthCategorySummaryInput({
      category,
      question,
      responses: scored(1, 4, 4, 5),
      priorCycles: []
    })
    expect(input?.current.answerCounts).toEqual([1, 0, 0, 2, 1])
    expect(input?.current.respondentCount).toBe(4)
  })

  it('reads an anonymous comment only as its rewrite, and a signed one as written', () => {
    const responses = [
      ...scored(3, 3),
      makeResponse({
        comment: 'Raw words only the author should ever see',
        commentParaphrased: 'A reworded version of the comment.',
        isAnonymous: true
      }),
      makeResponse({comment: 'Signed and shown as written.'}),
      makeResponse({comment: 'Rewrite still pending', commentParaphrased: '', isAnonymous: true}),
      makeResponse({comment: 'Rewrite failed', commentParaphrased: null, isAnonymous: true})
    ]
    const input = getTeamHealthCategorySummaryInput({
      category,
      question,
      responses,
      priorCycles: []
    })
    expect(input?.current.comments).toEqual([
      'A reworded version of the comment.',
      'Signed and shown as written.'
    ])
    const serialized = JSON.stringify(input)
    expect(serialized).not.toContain('Raw words')
    expect(serialized).not.toContain('Rewrite still pending')
    expect(serialized).not.toContain('Rewrite failed')
  })

  it('carries nothing about who answered', () => {
    const responses = [
      makeResponse({userId: 'user-ada', score: 2, comment: 'A signed comment'}),
      makeResponse({userId: 'user-bo', score: 3}),
      makeResponse({
        userId: 'user-cy',
        score: 4,
        comment: 'Original',
        commentParaphrased: 'Reworded',
        isAnonymous: true
      }),
      makeResponse({userId: 'user-di', score: 5})
    ]
    const input = getTeamHealthCategorySummaryInput({
      category,
      question,
      responses,
      priorCycles: []
    })
    expect(input).toEqual({
      category: 'Psychological Safety',
      question,
      current: {
        average: 3.5,
        respondentCount: 4,
        answerCounts: [0, 1, 1, 1, 1],
        comments: ['A signed comment', 'Reworded']
      },
      previous: null
    })
    expect(JSON.stringify(input)).not.toMatch(/user-/)
  })

  it('compares against the newest prior check that scored the category, and what it asked', () => {
    const input = getTeamHealthCategorySummaryInput({
      category,
      question,
      responses: scored(4, 4, 4),
      priorCycles: [
        makePriorCycle(null, ['A comment from a check that never scored the category']),
        makePriorCycle(3.2, ['Planning felt rushed.'], 'It is safe to take a risk on this team.'),
        makePriorCycle(2.1, ['An older comment'])
      ]
    })
    expect(input?.previous).toEqual({
      question: 'It is safe to take a risk on this team.',
      average: 3.2,
      comments: ['Planning felt rushed.']
    })
  })
})
