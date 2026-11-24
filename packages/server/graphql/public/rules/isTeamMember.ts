import {GraphQLError, type GraphQLResolveInfo} from 'graphql'
import {rule} from 'graphql-shield'
import type {LoaderType} from '../../../dataloader/foreignKeyLoaderMaker'
import type {AllPrimaryLoaders} from '../../../dataloader/RootDataLoader'
import type {RuleContext} from '../../graphql'
import {cacheByDotPath, getResolverDotPath, type ResolverDotPath} from './getResolverDotPath'

type LoadersWithTeamId = {
  [K in AllPrimaryLoaders]: 'teamId' extends keyof LoaderType<K> ? K : never
}[AllPrimaryLoaders]

type IDGetter = (obj: any) => string

type TeamCheckContext = Pick<RuleContext, 'authToken' | 'dataLoader' | 'resourceGrants'>

const notGrantedError = () =>
  new GraphQLError(`PAT does not grant access to this team`, {extensions: {code: 'FORBIDDEN'}})

export const isTeamExcludedByGrant = async (
  teamId: string,
  {authToken, dataLoader, resourceGrants}: TeamCheckContext
) => {
  if (!resourceGrants || !authToken || authToken.tms.includes(teamId)) return false
  const teamMembers = await dataLoader.get('teamMembersByUserId').load(authToken.sub)
  return teamMembers.some((teamMember) => teamMember.teamId === teamId)
}

export const getNotOnTeamError = async (teamId: string, context: TeamCheckContext) =>
  (await isTeamExcludedByGrant(teamId, context))
    ? notGrantedError()
    : new GraphQLError(`Viewer is not on team`, {extensions: {code: 'FORBIDDEN'}})

export const isTeamMember = <T>(
  dotPath: ResolverDotPath<T>,
  dataLoaderName?: LoadersWithTeamId,
  teamIdKey: string | IDGetter = 'teamId'
) =>
  rule(`isTeamMember-${dataLoaderName ?? ''}-${typeof teamIdKey === 'string' ? teamIdKey : ''}`, {
    cache: cacheByDotPath(dotPath)
  })(async (source, args, context: RuleContext, info: GraphQLResolveInfo) => {
    const argVar = getResolverDotPath(dotPath, source, args)
    const {authToken, dataLoader} = context

    // when the path resolves to an array of teamIds, require the viewer be on every team
    if (Array.isArray(argVar)) {
      for (const teamId of argVar as string[]) {
        if (!authToken?.tms?.includes(teamId)) return getNotOnTeamError(teamId, context)
        if (context.resourceGrants && !(await context.resourceGrants.hasTeam(teamId))) {
          return notGrantedError()
        }
      }
      return true
    }

    let teamId: string = argVar
    if (dataLoaderName) {
      const subject = await dataLoader.get(dataLoaderName as any).load(argVar)
      if (typeof teamIdKey === 'function') {
        teamId = teamIdKey(subject)
      } else {
        teamId = subject?.[teamIdKey]
      }
      if (!teamId)
        return new GraphQLError(`Permission lookup failed on ${dataLoaderName} for ${argVar}`, {
          extensions: {code: 'NOT_FOUND'}
        })
    }

    // Special case for ghost org so users can view meeting template meta
    if (info.operation.operation !== 'mutation' && teamId === 'aGhostTeam') return true

    if (!authToken?.tms?.includes(teamId)) return getNotOnTeamError(teamId, context)
    if (context.resourceGrants && !(await context.resourceGrants.hasTeam(teamId))) {
      return notGrantedError()
    }
    return true
  })
