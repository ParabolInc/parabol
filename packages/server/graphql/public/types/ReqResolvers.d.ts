import {Resolvers, ResolversParentTypes} from '../resolverTypes'

export type ReqResolvers<
  T extends keyof Resolvers,
  R = NonNullable<Resolvers[T]>,
  TParent = ResolversParentTypes[T]
  // If we aren't using a custom mapper, return the normal type
> = TParent extends {__typename?: string}
  ? R
  : // else, require all types that don't exist on the mapper
    R & {
      [P in keyof Omit<R, keyof TParent | '__isTypeOf'>]-?: R[P]
    }
