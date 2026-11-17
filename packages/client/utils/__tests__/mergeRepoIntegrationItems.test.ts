import mergeRepoIntegrationItems from '../mergeRepoIntegrationItems'

const item = (service: string, integrationRepoId: string) => ({service, integrationRepoId})

describe('mergeRepoIntegrationItems', () => {
  it('keeps previously used repos first, round-robins the rest, and dedupes on service + push id', () => {
    const prevUsed = [item('jira', 'cloud:WEB'), item('github', 'a/b')]
    const lists = [
      [item('github', 'a/b'), item('github', 'c/d')],
      [item('jira', 'cloud:OPS'), item('jira', 'cloud:WEB')]
    ]
    expect(mergeRepoIntegrationItems(prevUsed, lists)).toEqual([
      item('jira', 'cloud:WEB'),
      item('github', 'a/b'),
      item('jira', 'cloud:OPS'),
      item('github', 'c/d')
    ])
  })

  it('does not collide the same push id across services', () => {
    expect(
      mergeRepoIntegrationItems([], [[item('github', 'x')], [item('gitlab', 'x')]])
    ).toHaveLength(2)
  })
})
