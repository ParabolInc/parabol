import {GraphQLError} from 'graphql'
import {rule} from 'graphql-shield'
import type {GQLContext} from '../../graphql'
import type {TierEnum} from '../resolverTypes'
import {getResolverDotPath, type ResolverDotPath} from './getResolverDotPath'

export const isOrgTier = <T>(orgIdDotPath: ResolverDotPath<T>, requiredTier: TierEnum) =>
  rule(`isOrgTier-${orgIdDotPath}-${requiredTier}`, {cache: 'strict'})(
    async (source, args, {dataLoader}: GQLContext) => {
      const orgId = getResolverDotPath(orgIdDotPath, source, args)
      const organization = await dataLoader.get('organizations').load(orgId)
      if (!organization) return new GraphQLError('Organization not found')
      const {tier} = organization
      if (tier !== requiredTier) return new GraphQLError(`Organization is not ${requiredTier}`)
      return true
    }
  )
