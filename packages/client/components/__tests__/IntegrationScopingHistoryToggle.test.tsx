import {renderToStaticMarkup} from 'react-dom/server'
import type {
  ScopingCapability,
  ScopingSavedQuery
} from '../../integrations/platform/ClientIntegrationDefinition'
import IntegrationScopingHistoryToggle from '../IntegrationScopingHistoryToggle'
import type {SearchQueries} from '../ScopingSearchHistoryMenu'

const mockRendered: SearchQueries[][] = []

jest.mock('../../hooks/useSetScopingSearchState', () => ({
  __esModule: true,
  default: () => () => {}
}))
jest.mock('../../mutations/useRemoveIntegrationSearchQueryMutation', () => ({
  __esModule: true,
  default: () => [() => {}, false]
}))
jest.mock('../ScopingSearchHistoryToggle', () => ({
  __esModule: true,
  default: ({searchQueries}: {searchQueries: SearchQueries[]}) => {
    mockRendered.push(searchQueries)
    return null
  }
}))

const baseScoping: ScopingCapability = {
  Results: () => null,
  placeholder: () => '',
  parseSavedMeta: () => ({isAdvancedQuery: false, filters: []}),
  serializeMeta: () => '{}'
}

const savedQuery: ScopingSavedQuery = {
  id: 'q1',
  queryString: 'bug',
  isAdvancedQuery: false,
  filters: [
    {key: 'projectIds', value: '1001'},
    {key: 'projectIds', value: '1002'}
  ]
}

const secondLines = (scoping: ScopingCapability, savedQueries: ScopingSavedQuery[]) => {
  mockRendered.length = 0
  renderToStaticMarkup(
    <IntegrationScopingHistoryToggle
      scoping={scoping}
      service='gitlab'
      meetingId='m1'
      teamId='t1'
      savedQueries={savedQueries}
    />
  )
  return mockRendered[0]?.map(({labelSecondLine}) => labelSecondLine)
}

describe('IntegrationScopingHistoryToggle', () => {
  it('lists each filter by its chip label, or its raw value without one', () => {
    expect(secondLines(baseScoping, [savedQuery])).toEqual(['in 1001, 1002'])
    expect(
      secondLines({...baseScoping, filterChipLabel: ({value}) => `#${value}`}, [savedQuery])
    ).toEqual(['in #1001, #1002'])
  })

  it('lets a service label the whole filter set at once', () => {
    const savedFiltersLabel = (filters: ScopingSavedQuery['filters']) =>
      `${filters.length} projects`
    expect(secondLines({...baseScoping, savedFiltersLabel}, [savedQuery])).toEqual([
      'in 2 projects'
    ])
  })

  it('shows no second line for a saved query without filters', () => {
    const savedFiltersLabel = () => 'never shown'
    expect(
      secondLines({...baseScoping, savedFiltersLabel}, [{...savedQuery, filters: []}])
    ).toEqual([undefined])
  })
})
