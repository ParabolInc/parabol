jest.mock('../../../graphql/public/rootSchema', () => ({
  __esModule: true,
  githubRequest: jest.fn(),
  gitlabRequest: jest.fn(),
  linearRequest: jest.fn(),
  default: {}
}))

import {serverIntegrations} from '../registry'

const AUTH_STRATEGIES = ['oauth1', 'oauth2', 'pat', 'webhook']

describe.each(Object.values(serverIntegrations))('$service conformance', (def) => {
  it('has a valid authStrategy', () => {
    expect(AUTH_STRATEGIES).toContain(def.authStrategy)
  })

  it('exposes resolveAuth as a function of arity 1', () => {
    expect(typeof def.resolveAuth).toBe('function')
    expect(def.resolveAuth.length).toBe(1)
  })

  it('implements isAvailable', () => {
    expect(typeof def.isAvailable).toBe('function')
  })

  it('implements isConnected', () => {
    expect(typeof def.isConnected).toBe('function')
  })
})
