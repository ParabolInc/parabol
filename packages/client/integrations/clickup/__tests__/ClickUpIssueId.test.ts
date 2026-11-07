import ClickUpIssueId from '../shared/ClickUpIssueId'

describe('ClickUpIssueId', () => {
  it('round-trips join and split', () => {
    const integrationHash = ClickUpIssueId.join('repo1', 'issue1')
    expect(ClickUpIssueId.split(integrationHash)).toEqual({repoId: 'repo1', issueId: 'issue1'})
  })
})
