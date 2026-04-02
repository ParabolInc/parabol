import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import type {AllPrimaryLoaders} from '../../../dataloader/RootDataLoader'
import type {GQLContext} from '../../graphql'
import {getResolverDotPath, type ResolverDotPath} from './getResolverDotPath'

export const isUser = <T>(
  dotPath: ResolverDotPath<T>,
  dataLoaderName?: AllPrimaryLoaders,
  userIdKey = 'userId'
) =>
  rule(`isUser`, {cache: 'strict'})(async (source, args, context: GQLContext) => {
    const argVar = getResolverDotPath(dotPath, source, args)
    const {authToken, dataLoader} = context
    let userId: string = argVar
    if (dataLoaderName) {
      const subject = await dataLoader.get(dataLoaderName as any).load(argVar)
      if (!subject?.[userIdKey])
        return new GraphQLError(`Permission lookup failed on ${dataLoaderName} for ${argVar}`)
      userId = subject[userIdKey]
    }
    if (authToken.sub !== userId) return new GraphQLError(`Viewer is not on team`)
    return true
  })
