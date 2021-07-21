import GitHubRepoId from './GitHubRepoId'
const GitHubIssueId = {
  join: (nameWithOwner: string, issueNumber: number) => `${nameWithOwner}:${issueNumber}`,
  split: (id: string) => {
    const delimeterIdx = id.lastIndexOf(':')
    const nameWithOwner = id.slice(0, delimeterIdx)
    const issueNumber = id.slice(delimeterIdx + 1)
    const {repoOwner, repoName} = GitHubRepoId.split(nameWithOwner)
    return {nameWithOwner, issueNumber, repoOwner, repoName}
  }
}

export default GitHubIssueId
