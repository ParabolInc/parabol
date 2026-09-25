import {makeLinearIssueFilter} from '../makeLinearIssueFilter'

describe('makeLinearIssueFilter', () => {
  it('returns null when there is nothing to narrow by', () => {
    expect(makeLinearIssueFilter('', [])).toBeNull()
    expect(makeLinearIssueFilter('   ', [])).toBeNull()
  })

  it('searches the title and description with the trimmed query', () => {
    expect(makeLinearIssueFilter('  retro  ', [])).toEqual({
      and: [
        {
          or: [
            {description: {containsIgnoreCaseAndAccent: 'retro'}},
            {title: {containsIgnoreCaseAndAccent: 'retro'}}
          ]
        }
      ]
    })
  })

  it('adds an identifier clause for a team-prefixed issue number', () => {
    expect(makeLinearIssueFilter('par-42', [])).toEqual({
      and: [
        {
          or: [
            {description: {containsIgnoreCaseAndAccent: 'par-42'}},
            {title: {containsIgnoreCaseAndAccent: 'par-42'}},
            {and: [{team: {key: {eqIgnoreCase: 'PAR'}}}, {number: {eq: 42}}]}
          ]
        }
      ]
    })
  })

  it('adds an identifier clause for a bare issue number', () => {
    expect(makeLinearIssueFilter('42', [])).toEqual({
      and: [
        {
          or: [
            {description: {containsIgnoreCaseAndAccent: '42'}},
            {title: {containsIgnoreCaseAndAccent: '42'}},
            {number: {eq: 42}}
          ]
        }
      ]
    })
  })

  it('reads the project and team filters off their keys, ignoring any other key', () => {
    const filters = [
      {key: 'project', value: 'project-1'},
      {key: 'team', value: 'team-1'},
      {key: 'project', value: 'project-2'},
      {key: 'repo', value: 'ignored'}
    ]
    expect(makeLinearIssueFilter('', filters)).toEqual({
      and: [
        {
          or: [
            {project: {id: {eq: 'project-1'}}},
            {project: {id: {eq: 'project-2'}}},
            {team: {id: {eq: 'team-1'}}}
          ]
        }
      ]
    })
  })

  it('ands the text search with the project and team filters', () => {
    expect(makeLinearIssueFilter('retro', [{key: 'team', value: 'team-1'}])).toEqual({
      and: [
        {
          or: [
            {description: {containsIgnoreCaseAndAccent: 'retro'}},
            {title: {containsIgnoreCaseAndAccent: 'retro'}}
          ]
        },
        {or: [{team: {id: {eq: 'team-1'}}}]}
      ]
    })
  })
})
