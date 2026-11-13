import {ExecutionError, Redlock} from '@sesamecare-oss/redlock'
import {GraphQLError, type GraphQLResolveInfo} from 'graphql'
import getRedis from '../../../../utils/getRedis'
import type {ErrorPayload, ResolverFn} from '../../resolverTypes'

/**
 * Check if a resolver is already running for this mutation and if so, throw.
 */
export const checkSequential =
  <TSuccessPayload, TResult extends ErrorPayload | TSuccessPayload, TParent, TContext, TArgs>(
    resolver: ResolverFn<TResult, TParent, TContext, TArgs>
  ) =>
  async (parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo) => {
    const {fieldName} = info
    const redis = getRedis()
    const redlock = new Redlock([redis], {retryCount: 0})

    try {
      return await redlock.using([`checkSequential_${fieldName}`], 10_000, async () => {
        return resolver(parent, args, context, info)
      })
    } catch (e) {
      if (e instanceof ExecutionError) {
        throw new GraphQLError(`Mutation ${fieldName} is already running`, {
          extensions: {code: 'CONFLICT'}
        })
      }
      throw e
    }
  }
