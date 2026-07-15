import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import TaskSecondaryStatusId from '../../../../client/shared/gqlIds/TaskSecondaryStatusId'
import type {GQLContext} from '../../graphql'
import {getResolverDotPath, type ResolverDotPath} from './getResolverDotPath'

// isTeamMember can't decode composite ids (taskSecondaryStatus:<int>), so this
// rule splits the id, loads the row, and team-gates — modeled on hasPageAccess
export const isTeamMemberOfTaskSecondaryStatus = <T>(dotPath: ResolverDotPath<T>) =>
  rule(`isTeamMemberOfTaskSecondaryStatus-${dotPath}`, {cache: 'strict'})(
    async (source, args, context: GQLContext) => {
      const gqlId = getResolverDotPath(dotPath, source, args)
      const {authToken, dataLoader} = context
      const taskSecondaryStatusId = TaskSecondaryStatusId.split(gqlId)
      if (Number.isNaN(taskSecondaryStatusId)) {
        return new GraphQLError('Invalid TaskSecondaryStatus id')
      }
      const row = await dataLoader.get('taskSecondaryStatuses').load(taskSecondaryStatusId)
      if (!row) return new GraphQLError('Secondary status not found')
      const {teamId} = row
      if (!authToken.tms?.includes(teamId)) {
        return new GraphQLError(`Viewer is not on team`)
      }
      if (context.resourceGrants && !(await context.resourceGrants.hasTeam(teamId))) {
        return new GraphQLError(`PAT does not grant access to this team`)
      }
      return true
    }
  )
