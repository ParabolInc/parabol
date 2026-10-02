import type {GraphQLResolveInfo} from 'graphql'
import type {GQLContext} from '../../../graphql'
import clearSAMLConnection from '../../../mutations/helpers/clearSAMLConnection'
import disconnectSAML from '../disconnectSAML'

jest.mock('../../../../utils/getSAMLURLFromEmail', () => ({isSingleTenantSSO: true}))
jest.mock('../../../mutations/helpers/clearSAMLConnection', () => ({
  __esModule: true,
  default: jest.fn()
}))

const info = {} as GraphQLResolveInfo
const resolve = disconnectSAML
if (typeof resolve !== 'function') throw new Error('resolver must be a function')

test('an instance whose only sign-in method is SSO cannot disconnect its identity provider', async () => {
  const context = {authToken: {sub: 'orgAdminId'}, dataLoader: {}} as unknown as GQLContext
  await expect(resolve({}, {samlId: 'acme'}, context, info)).rejects.toThrow(
    'SSO is the only way to sign in to this instance'
  )
  expect(clearSAMLConnection).not.toHaveBeenCalled()
})
