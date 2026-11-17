import GitHubRepoId from './GitHubRepoId'

// This ID is unique to all of GitHub. Used as the Task.integrationHash
const GitHubIssueId = {
  join: (nameWithOwner: string, issueNumber: number) => `${nameWithOwner}:${issueNumber}`,
  split: (id: string) => {
    const delimeterIdx = id.lastIndexOf(':')
    const nameWithOwner = id.slice(0, delimeterIdx)
    const issueNumber = Number(id.slice(delimeterIdx + 1))
    const {repoOwner, repoName} = GitHubRepoId.split(nameWithOwner)
    return {nameWithOwner, issueNumber, repoOwner, repoName}
  }
}

export default GitHubIssueId
