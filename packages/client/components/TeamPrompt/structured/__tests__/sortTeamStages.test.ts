import {
  getMemberSharedAt,
  getSharedResponses,
  type StructuredAnswer,
  type StructuredStage,
  sortTeamStages
} from '../teamPromptStages'

const makeStage = (
  id: string,
  userId: string,
  responses: readonly StructuredAnswer[]
): StructuredStage => ({
  id,
  teamMember: {userId, user: {preferredName: userId, picture: ''}},
  responses
})

const makeResponse = (
  overrides: Partial<StructuredResponseSummary> = {}
): StructuredResponseSummary => ({
  id: 'response1',
  isShared: false,
  sharedAt: null,
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-09-01T00:00:00.000Z',
  answeredPromptIds: [],
  ...overrides
})

describe('sortTeamStages', () => {
  it('excludes the viewer from every partition', () => {
    const stages = [
      makeStage('viewer', 'user1', [makeAnswer('2026-09-01T01:00:00.000Z')]),
      makeStage('other', 'user2', [makeAnswer('2026-09-01T02:00:00.000Z')])
    ]
    const {shared, waiting} = sortTeamStages(stages, 'user1')
    expect(shared.map((stage) => stage.id)).toEqual(['other'])
    expect(waiting).toHaveLength(0)
  })

  it('partitions members who shared from members who have not', () => {
    const stages = [
      makeStage('shared', 'user2', [makeAnswer('2026-09-01T02:00:00.000Z'), makeAnswer()]),
      makeStage('cleared', 'user3', [makeAnswer()]),
      makeStage('empty', 'user4', [])
    ]
    const {shared, waiting} = sortTeamStages(stages, 'user1')
    expect(shared.map((stage) => stage.id)).toEqual(['shared'])
    expect(waiting.map((stage) => stage.id)).toEqual(['cleared', 'empty'])
  })

  it('orders shared members by their first share', () => {
    const stages = [
      makeStage('late', 'user2', [makeAnswer('2026-09-01T09:00:00.000Z')]),
      makeStage('early', 'user3', [
        makeAnswer('2026-09-01T10:00:00.000Z'),
        makeAnswer('2026-09-01T07:00:00.000Z')
      ])
    ]
    const {shared} = sortTeamStages(stages, 'user1')
    expect(shared.map((stage) => stage.id)).toEqual(['early', 'late'])
    expect(drafting.map((stage) => stage.id)).toEqual(['fresh', 'stale'])
  })

  it('orders a shared response with no sharedAt by createdAt', () => {
    const stages = [
      makeStage(
        'noSharedAt',
        'user2',
        makeResponse({isShared: true, sharedAt: null, createdAt: '2026-09-01T03:00:00.000Z'})
      ),
      makeStage(
        'shared',
        'user3',
        makeResponse({isShared: true, sharedAt: '2026-09-01T02:00:00.000Z'})
      )
    ]
    const {shared} = sortTeamStages(stages, 'user1')
    expect(shared.map((stage) => stage.id)).toEqual(['shared', 'noSharedAt'])
  })
})
