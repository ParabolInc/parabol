const GitHubRepoId = {
  join: (repoOwner: string, repoName: string) => `${repoOwner}/${repoName}`,
  split: (nameWithOwner: string) => {
    const delimeterIdx = nameWithOwner.indexOf('/')
    const repoOwner = nameWithOwner.slice(0, delimeterIdx)
    const repoName = nameWithOwner.slice(delimeterIdx + 1)
    return {repoOwner, repoName}
  }
}

export default GitHubRepoId
