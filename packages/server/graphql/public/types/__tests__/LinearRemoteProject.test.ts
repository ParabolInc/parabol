import IntegrationRepoId from 'parabol-client/shared/gqlIds/IntegrationRepoId'
import type {LinearProject} from '../../../../integrations/platform/RemoteRepoIntegration'
import LinearRemoteProject from '../LinearRemoteProject'

const resolve = (resolver: unknown, source: LinearProject) => {
  if (typeof resolver !== 'function') throw new Error('resolver must be a function')
  return resolver(source)
}

const project: LinearProject = {
  service: 'linear',
  id: 'proj1',
  teamId: 'team1',
  name: 'Test project',
  teams: {nodes: [{id: 'team1', displayName: 'Parabol'}]}
}

describe('LinearRemoteProject', () => {
  it('names the project after its team', () => {
    expect(resolve(LinearRemoteProject.name, project)).toBe('Parabol/Test project')
  })

  it('falls back to the bare project name without a cached team', () => {
    expect(resolve(LinearRemoteProject.name, {...project, teams: null})).toBe('Test project')
    expect(resolve(LinearRemoteProject.name, {...project, teams: {nodes: []}})).toBe('Test project')
  })

  it('keys the record and the push id on the shared codec', () => {
    const expected = IntegrationRepoId.join({service: 'linear', id: 'proj1', teamId: 'team1'})
    expect(expected).toBe('team1:proj1')
    expect(resolve(LinearRemoteProject.id, project)).toBe(expected)
    expect(resolve(LinearRemoteProject.integrationRepoId, project)).toBe(expected)
  })
})
