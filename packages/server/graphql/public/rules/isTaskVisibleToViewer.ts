import {GraphQLError} from 'graphql'
import {rule} from 'graphql-guard'
import {getUserId} from '../../../utils/authorization'
import type {RuleContext} from '../../graphql'
import {cacheByDotPath, getResolverDotPath, type ResolverDotPath} from './getResolverDotPath'

export const isTaskVisibleToViewer = <T>(dotPath: ResolverDotPath<T>) =>
  rule('isTaskVisibleToViewer', {cache: cacheByDotPath(dotPath)})(
    async (source, args, {authToken, dataLoader}: RuleContext) => {
      const taskId = getResolverDotPath(dotPath, source, args)
      const task = await dataLoader.get('tasks').load(taskId)
      const isVisible =
        !!task && (!task.tags.includes('private') || task.userId === getUserId(authToken))
      if (!isVisible) return new GraphQLError('Task not found', {extensions: {code: 'NOT_FOUND'}})
      return true
    }
  )
