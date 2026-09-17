import {
  type StructuredResponseSummary,
  type StructuredStage,
  sortTeamStages
} from '../teamPromptStages'

const makeStage = (
  id: string,
  userId: string,
  response: StructuredStage['response']
): StructuredStage => ({
  id,
  teamMember: {userId, user: {preferredName: userId, picture: ''}},
  response
})

const makeResponse = (
  overrides: Partial<StructuredResponseSummary> = {}
): StructuredResponseSummary => ({
  id: 'response1',
  isShared: false,
  sharedAt: null,
  updatedAt: '2026-09-01T00:00:00.000Z',
  answeredPromptIds: [],
  ...overrides
})

describe('sortTeamStages', () => {
  it('excludes the viewer from every partition', () => {
    const stages = [
      makeStage(
        'viewer',
        'user1',
        makeResponse({isShared: true, sharedAt: '2026-09-01T01:00:00.000Z'})
      ),
      makeStage(
        'other',
        'user2',
        makeResponse({isShared: true, sharedAt: '2026-09-01T02:00:00.000Z'})
      )
    ]
    const {shared, drafting, notStarted} = sortTeamStages(stages, 'user1')
    expect(shared.map((stage) => stage.id)).toEqual(['other'])
    expect(drafting).toHaveLength(0)
    expect(notStarted).toHaveLength(0)
  })

  it('partitions shared, drafting and not started', () => {
    const stages = [
      makeStage(
        'shared',
        'user2',
        makeResponse({isShared: true, sharedAt: '2026-09-01T02:00:00.000Z'})
      ),
      makeStage('drafting', 'user3', makeResponse({isShared: false})),
      makeStage('nullResponse', 'user4', null),
      makeStage('undefinedResponse', 'user5', undefined)
    ]
    const {shared, drafting, notStarted} = sortTeamStages(stages, 'user1')
    expect(shared.map((stage) => stage.id)).toEqual(['shared'])
    expect(drafting.map((stage) => stage.id)).toEqual(['drafting'])
    expect(notStarted.map((stage) => stage.id)).toEqual(['nullResponse', 'undefinedResponse'])
  })

  it('orders shared by sharedAt ascending and drafting by updatedAt descending', () => {
    const stages = [
      makeStage(
        'late',
        'user2',
        makeResponse({isShared: true, sharedAt: '2026-09-01T09:00:00.000Z'})
      ),
      makeStage(
        'early',
        'user3',
        makeResponse({isShared: true, sharedAt: '2026-09-01T07:00:00.000Z'})
      ),
      makeStage('stale', 'user4', makeResponse({updatedAt: '2026-09-01T05:00:00.000Z'})),
      makeStage('fresh', 'user5', makeResponse({updatedAt: '2026-09-01T08:00:00.000Z'}))
    ]
    const {shared, drafting} = sortTeamStages(stages, 'user1')
    expect(shared.map((stage) => stage.id)).toEqual(['early', 'late'])
    expect(drafting.map((stage) => stage.id)).toEqual(['fresh', 'stale'])
  })

  it('tolerates a shared response with no sharedAt', () => {
    const stages = [
      makeStage('noSharedAt', 'user2', makeResponse({isShared: true, sharedAt: null})),
      makeStage(
        'shared',
        'user3',
        makeResponse({isShared: true, sharedAt: '2026-09-01T02:00:00.000Z'})
      )
    ]
    expect(() => sortTeamStages(stages, 'user1')).not.toThrow()
    expect(sortTeamStages(stages, 'user1').shared).toHaveLength(2)
  })
})
