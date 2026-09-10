import type {EstimatePushTargetEnum} from '../../../graphql/public/resolverTypes'
import type {EstimatePushTarget} from '../ServerIntegrationDefinition'

type MutuallyAssignable<A, B> = [A] extends [B] ? ([B] extends [A] ? true : never) : never

it('the EstimatePushTargetEnum SDL and EstimatePushTarget stay in sync', () => {
  const inSync: MutuallyAssignable<EstimatePushTargetEnum, EstimatePushTarget> = true
  expect(inSync).toBe(true)
})
