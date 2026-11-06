import GitLabProjectId from '../GitLabProjectId'

const providerId = 1
const projectId = 42

describe('GitLabProjectId', () => {
  it('round-trips join and split', () => {
    const id = GitLabProjectId.join(providerId, projectId)
    expect(GitLabProjectId.split(id)).toEqual({providerId, projectId})
  })

  it('splits a real-looking repoId into numeric providerId and projectId', () => {
    expect(GitLabProjectId.split('7:12345')).toEqual({providerId: 7, projectId: 12345})
  })
})
