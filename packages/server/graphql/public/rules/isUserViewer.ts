import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import type {AllPrimaryLoaders} from '../../../dataloader/RootDataLoader'
import {getUserId} from '../../../utils/authorization'
import {CipherId} from '../../../utils/CipherId'
import type {GQLContext} from '../../graphql'
import {getResolverDotPath, type ResolverDotPath} from './getResolverDotPath'

export const isUserViewer = <T>(
  dotPath: ResolverDotPath<T>,
  dataLoaderName?: AllPrimaryLoaders,
  // the field on the loaded subject that holds the owning userId (e.g. 'createdBy' for authored rows)
  ownerField: 'userId' | 'createdBy' = 'userId'
) =>
  rule(`isUserViewer-${dotPath}-${dataLoaderName ?? ''}-${ownerField}`, {cache: 'strict'})(
    async (source, args, {authToken, dataLoader}: GQLContext) => {
      const argVar = getResolverDotPath(dotPath, source, args)
      let userId: string = argVar
      if (dataLoaderName) {
        // loaders are keyed by the raw db id; args carry a CipherId-encoded client id while
        // source paths already hold the raw id
        const dbId = dotPath.startsWith('source') ? argVar : CipherId.fromClient(argVar)[0]
        const subject = await dataLoader.get(dataLoaderName as any).load(dbId)
        const ownerId = subject?.[ownerField]
        if (!ownerId)
          return new GraphQLError(`Permission lookup failed on ${dataLoaderName} for ${argVar}`)
        userId = ownerId
      }
      const viewerId = getUserId(authToken)
      if (userId !== viewerId) return new GraphQLError('Viewer is incorrect user')
      return true
    }
  )
