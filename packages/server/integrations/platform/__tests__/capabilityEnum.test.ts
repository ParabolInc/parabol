import type {IntegrationCapabilityEnum} from '../../../graphql/public/resolverTypes'
import type {IntegrationCapabilityKey} from '../ServerIntegrationDefinition'

type MutuallyAssignable<A, B> = [A] extends [B] ? ([B] extends [A] ? true : never) : never

it('the IntegrationCapabilityEnum SDL and IntegrationCapabilityKey stay in sync', () => {
  const inSync: MutuallyAssignable<IntegrationCapabilityEnum, IntegrationCapabilityKey> = true
  expect(inSync).toBe(true)
})
