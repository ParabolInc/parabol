import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import type {RuleContext} from '../../graphql'
import {cacheByDotPath, getResolverDotPath, type ResolverDotPath} from './getResolverDotPath'

export const hasNoPageGrantForParent = <T>(dotPath: ResolverDotPath<T>) =>
  rule('hasNoPageGrantForParent', {cache: cacheByDotPath(dotPath)})(
    (source, args, {resourceGrants}: RuleContext) =>
      !getResolverDotPath(dotPath, source, args) || !resourceGrants?.hasPageGrants()
        ? true
        : new GraphQLError(
            "This access token can only reach the pages it was given, so it can't add pages inside them",
            {extensions: {code: 'FORBIDDEN'}}
          )
  )
