import IntegrationServiceId from '../IntegrationServiceId'

const teamId = 'team1'
const userId = 'local|Pe8zMFMRi0'

describe('IntegrationServiceId', () => {
  it('round-trips join and split', () => {
    const id = IntegrationServiceId.join(teamId, userId, 'linear')
    expect(IntegrationServiceId.split(id)).toEqual({service: 'linear', teamId, userId})
  })

  it('namespaces the id so it never collides with LinearIntegration.id', () => {
    const id = IntegrationServiceId.join(teamId, userId, 'linear')
    expect(id.startsWith('integrationService:')).toBe(true)
    expect(id).not.toBe(`linear:${teamId}:${userId}`)
  })
})
