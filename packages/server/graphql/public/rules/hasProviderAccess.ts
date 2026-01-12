import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import {getUserId, isUserOrgAdmin} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import {getResolverDotPath, type ResolverDotPath} from './getResolverDotPath'

export const hasProviderAccess = <T>(dotPath: ResolverDotPath<T>) =>
  rule('hasProviderAccess', {cache: 'strict'})(async (source, args, context) => {
    const providerIdArg = getResolverDotPath(dotPath, source, args)
    if (!providerIdArg) {
      return true
    }

    const {authToken, dataLoader} = context
    const viewerId = getUserId(authToken)
    const [providerId] = CipherId.fromClient(providerIdArg)
    const provider = await dataLoader.get('oAuthProviders').load(providerId)

    if (!provider) {
      return true
    }

    if (!(await isUserOrgAdmin(viewerId, provider.orgId, dataLoader))) {
      return new GraphQLError('Insufficient permission', {
        extensions: {
          code: 'FORBIDDEN'
        }
      })
    }

    return true
  })
