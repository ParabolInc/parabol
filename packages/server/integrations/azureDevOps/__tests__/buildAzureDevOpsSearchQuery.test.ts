import buildAzureDevOpsSearchQuery from '../buildAzureDevOpsSearchQuery'

describe('buildAzureDevOpsSearchQuery', () => {
  it('returns the stored shape with a trimmed queryString and sorted project names', () => {
    expect(
      buildAzureDevOpsSearchQuery(' bug ', {isWIQL: false, projectNames: ['Web', 'Api', 'Web']})
    ).toEqual({queryString: 'bug', isWIQL: false, projectNames: ['Api', 'Web']})
  })

  it('accepts WIQL', () => {
    expect(
      buildAzureDevOpsSearchQuery("[System.State] <> 'Closed'", {isWIQL: true, projectNames: []})
    ).toEqual({queryString: "[System.State] <> 'Closed'", isWIQL: true, projectNames: []})
  })

  it.each([
    ['missing isWIQL', {projectNames: []}],
    ['non-boolean isWIQL', {isWIQL: 'true', projectNames: []}],
    ['missing projectNames', {isWIQL: false}],
    ['empty project name', {isWIQL: false, projectNames: ['']}],
    ['Jira’s keys', {isJQL: false, projectKeyFilters: []}]
  ])('rejects %s', (_label, meta) => {
    expect(buildAzureDevOpsSearchQuery('bug', meta)).toBeInstanceOf(Error)
  })

  it('rejects an oversized queryString', () => {
    expect(
      buildAzureDevOpsSearchQuery('x'.repeat(2001), {isWIQL: false, projectNames: []})
    ).toBeInstanceOf(Error)
  })
})
