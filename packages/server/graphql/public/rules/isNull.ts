import {rule} from 'graphql-shield'
import {getResolverDotPath, type ResolverDotPath} from './getResolverDotPath'

export const isNull = <T>(dotPath: ResolverDotPath<T>) =>
  rule(`isNull`, {cache: 'strict'})((source, args) => {
    const value = getResolverDotPath(dotPath, source, args)
    return value == null
  })
