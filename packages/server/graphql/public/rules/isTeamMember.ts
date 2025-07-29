import {rule} from 'graphql-shield'
import type {GQLContext} from '../../graphql'
import {getResolverDotPath, type ResolverDotPath} from './getResolverDotPath'

export const isTeamMember = <T>(dotPath: ResolverDotPath<T>) =>
  rule(`isTeamMember`, {cache: 'strict'})(async (source, args, context: GQLContext) => {
    const teamId = getResolverDotPath(dotPath, source, args)
    const {authToken} = context
    if (!authToken.tms.includes(teamId)) {
      return `Viewer is not on team`
    }
    return true
  })
