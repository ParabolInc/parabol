import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import type {LoaderType} from '../../../dataloader/foreignKeyLoaderMaker'
import type {AllPrimaryLoaders} from '../../../dataloader/RootDataLoader'
import type {GQLContext} from '../../graphql'
import {getResolverDotPath, type ResolverDotPath} from './getResolverDotPath'

type LoadersWithTeamId = {
  [K in AllPrimaryLoaders]: 'teamId' extends keyof LoaderType<K> ? K : never
}[AllPrimaryLoaders]

type IDGetter = (obj: any) => string
export const isTeamMember = <T>(
  dotPath: ResolverDotPath<T>,
  dataLoaderName?: LoadersWithTeamId,
  teamIdKey: string | IDGetter = 'teamId'
) =>
  rule(`isTeamMember`, {cache: 'strict'})(async (source, args, context: GQLContext) => {
    const argVar = getResolverDotPath(dotPath, source, args)
    const {authToken, dataLoader} = context
    let teamId: string = argVar
    if (dataLoaderName) {
      const subject = await dataLoader.get(dataLoaderName as any).load(argVar)
      if (typeof teamIdKey === 'function') {
        teamId = teamIdKey(subject)
      } else {
        teamId = subject?.[teamIdKey]
      }
      if (!teamId)
        return new GraphQLError(`Permission lookup failed on ${dataLoaderName} for ${argVar}`)
    }

    if (!authToken.tms.includes(teamId)) {
      return new GraphQLError(`Viewer is not on team`)
    }
    return true
  })
