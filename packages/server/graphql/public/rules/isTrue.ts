import {rule} from 'graphql-shield'
import {getResolverDotPath, type ResolverDotPath} from './getResolverDotPath'

export const isTrue = <T>(dotPath: ResolverDotPath<T>) =>
  rule(`isTrue-${dotPath}`, {cache: 'strict'})((source, args) => {
    return getResolverDotPath(dotPath, source, args) === true
  })
