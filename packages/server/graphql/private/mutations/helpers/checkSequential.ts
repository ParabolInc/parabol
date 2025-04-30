import {GraphQLResolveInfo} from "graphql";
import {ErrorPayload, ResolverFn} from "../../resolverTypes";
import getRedis from "../../../../utils/getRedis";
import Redlock from "redlock";
import standardError from "../../../../utils/standardError";

/**
 * Check if a resolver is already running for this mutation and if so, return an error.
 */
export const checkSequential = <TSuccessPayload, TResult extends ErrorPayload | TSuccessPayload, TParent, TContext, TArgs>(resolver: ResolverFn<TResult, TParent, TContext, TArgs>) => (
  async (parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo) => {
    const {fieldName} = info
    const redis = getRedis()
    const redlock = new Redlock([redis], {retryCount: 0})

    try {
      console.log(`Attempting to acquire lock for ${fieldName}`)
      return await redlock.using([`checkSequential_${fieldName}`], 10_000, async () => {
        console.log(`Lock acquired for ${fieldName}`)
        return resolver(parent, args, context, info);
      })
    } catch (error) {
      return standardError(new Error(`Mutation ${fieldName} is already running`))
    }
  }
)

