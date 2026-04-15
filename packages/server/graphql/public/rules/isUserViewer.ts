import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import type {AllPrimaryLoaders} from '../../../dataloader/RootDataLoader'
import {getUserId} from '../../../utils/authorization'
import type {GQLContext} from '../../graphql'
import {getResolverDotPath, type ResolverDotPath} from './getResolverDotPath'

export const isUserViewer = <T>(
  orgIdDotPath: ResolverDotPath<T>,
  dataLoaderName?: AllPrimaryLoaders
) =>
  rule(`isUserViewer-${orgIdDotPath}`, {cache: 'strict'})(
    async (source, args, {authToken, dataLoader}: GQLContext) => {
      const argVar = getResolverDotPath(orgIdDotPath, source, args)
      let userId: string = argVar
      if (dataLoaderName) {
        const subject = await dataLoader.get(dataLoaderName as any).load(argVar)
        if (!subject?.userId)
          return new GraphQLError(`Permission lookup failed on ${dataLoaderName} for ${argVar}`)
        userId = subject.userId
      }
      const viewerId = getUserId(authToken)
      if (userId !== viewerId) return new GraphQLError('Viewer is incorrect user')
      return true
    }
  )
