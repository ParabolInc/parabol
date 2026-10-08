import azureDevOpsSearchMeta from '../../azureDevOps/azureDevOpsSearchMeta'
import gitLabSearchMeta from '../../gitlab/gitLabSearchMeta'
import jiraSearchMeta from '../../jira/jiraSearchMeta'
import linearSearchMeta from '../../linear/linearSearchMeta'
import type {ScopingSearchState} from '../ScopingSearchState'

const codecs = [
  {
    name: 'jira',
    codec: jiraSearchMeta,
    state: {
      queryString: 'project = ABC',
      isAdvancedQuery: true,
      filters: [
        {key: 'project', value: 'cloud:ABC'},
        {key: 'project', value: 'cloud:DEF'}
      ]
    },
    wire: {isJQL: true, projectKeyFilters: ['cloud:ABC', 'cloud:DEF']}
  },
  {
    name: 'gitlab',
    codec: gitLabSearchMeta,
    state: {
      queryString: 'bug',
      isAdvancedQuery: false,
      filters: [{key: 'project', value: 'gid://gitlab/Project/1'}]
    },
    wire: {projectIds: ['gid://gitlab/Project/1']}
  },
  {
    name: 'linear',
    codec: linearSearchMeta,
    state: {
      queryString: 'bug',
      isAdvancedQuery: false,
      filters: [
        {key: 'project', value: 'project-uuid'},
        {key: 'team', value: 'team-uuid'}
      ]
    },
    wire: {projectIds: ['project-uuid'], teamIds: ['team-uuid']}
  },
  {
    name: 'azureDevOps',
    codec: azureDevOpsSearchMeta,
    state: {
      queryString: "[System.State] <> 'Closed'",
      isAdvancedQuery: true,
      filters: [{key: 'project', value: 'Web'}]
    },
    wire: {isWIQL: true, projectNames: ['Web']}
  }
] satisfies {name: string; codec: unknown; state: ScopingSearchState; wire: object}[]

describe.each(codecs)('$name search meta', ({codec, state, wire}) => {
  it('serializes the search state into the keys the service’s server integration validates', () => {
    expect(JSON.parse(codec.serializeMeta(state))).toEqual(wire)
  })

  it('parses saved meta back into the state it was serialized from', () => {
    const {isAdvancedQuery, filters} = state
    expect(codec.parseSavedMeta(JSON.stringify(wire))).toEqual({isAdvancedQuery, filters})
  })

  it.each([
    ['an empty object', '{}'],
    ['malformed JSON', '{'],
    ['a JSON array', '[]'],
    [
      'wrongly typed values',
      JSON.stringify(Object.fromEntries(Object.keys(wire).map((key) => [key, 7])))
    ]
  ])('reads %s as a plain search with no filters', (_label, meta) => {
    expect(codec.parseSavedMeta(meta)).toEqual({isAdvancedQuery: false, filters: []})
  })
})
