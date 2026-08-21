import type {ServerIntegrationDefinition} from '../ServerIntegrationDefinition'

const AUTH_STRATEGIES = ['oauth1', 'oauth2', 'pat', 'webhook']

export const describeServerIntegrationConformance = (def: ServerIntegrationDefinition) => {
  describe(`${def.service} conformance`, () => {
    it('has a valid authStrategy', () => {
      expect(AUTH_STRATEGIES).toContain(def.authStrategy)
    })

    it('declares at least one capability', () => {
      expect(Object.keys(def.capabilities).length).toBeGreaterThan(0)
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
}
