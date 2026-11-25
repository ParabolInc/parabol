import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import type {RuleContext} from '../../graphql'
import {cacheByDotPath, getResolverDotPath, type ResolverDotPath} from './getResolverDotPath'

export const getPageGrantSubPageError = () =>
  new GraphQLError("An access token given specific pages can't create sub-pages", {
    extensions: {code: 'FORBIDDEN'}
  })

export const hasNoPageGrantForParent = <T>(dotPath: ResolverDotPath<T>) =>
  rule('hasNoPageGrantForParent', {cache: cacheByDotPath(dotPath)})(
    (source, args, {resourceGrants}: RuleContext) =>
      !getResolverDotPath(dotPath, source, args) || !resourceGrants?.hasPageGrants()
        ? true
        : getPageGrantSubPageError()
  )
