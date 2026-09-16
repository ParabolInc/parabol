import JiraServerProjectId from '../JiraServerProjectId'

const providerId = 1
const projectId = 'PROJ-1'

describe('JiraServerProjectId', () => {
  it('round-trips join and split', () => {
    const id = JiraServerProjectId.join(providerId, projectId)
    expect(JiraServerProjectId.split(id)).toEqual({providerId, projectId})
  })

  it('splits a real-looking repoId into a numeric providerId and string projectId', () => {
    expect(JiraServerProjectId.split('7:10001')).toEqual({providerId: 7, projectId: '10001'})
  })
})
