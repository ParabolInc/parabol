import {rule} from 'graphql-shield'
import {getResolverDotPath, type ResolverDotPath} from './getResolverDotPath'

export const isSet = <T>(dotPath: ResolverDotPath<T>) =>
  rule(`isSet-${dotPath}`, {cache: 'strict'})((source, args) =>
    Boolean(getResolverDotPath(dotPath, source, args))
  )
