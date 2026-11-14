import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import {getRuleViewerId, isUserOrgAdmin} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import type {RuleContext} from '../../graphql'
import {getResolverDotPath, type ResolverDotPath} from './getResolverDotPath'

export const hasProviderAccess = <T>(dotPath: ResolverDotPath<T>) =>
  rule('hasProviderAccess', {cache: 'strict'})(async (source, args, context: RuleContext) => {
    const providerIdArg = getResolverDotPath(dotPath, source, args)
    if (!providerIdArg) {
      return true
    }

    const {authToken, dataLoader} = context
    const viewerId = getRuleViewerId(authToken)
    const [providerId] = CipherId.fromClient(providerIdArg)
    const provider = await dataLoader.get('oAuthProviders').load(providerId)

    if (!provider) {
      return true
    }

    const isGranted =
      !context.resourceGrants || (await context.resourceGrants.hasOrg(provider.orgId))
    if (!isGranted || !(await isUserOrgAdmin(viewerId, provider.orgId, dataLoader))) {
      return new GraphQLError('Insufficient permission', {
        extensions: {
          code: 'FORBIDDEN'
        }
      })
    }

    return true
  })
