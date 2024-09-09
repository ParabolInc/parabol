import {rule} from 'graphql-shield'
import {GQLContext} from '../../graphql'
import {TierEnum} from '../resolverTypes'
import {ResolverDotPath, getResolverDotPath} from './getResolverDotPath'

export const isOrgTier = <T>(orgIdDotPath: ResolverDotPath<T>, requiredTier: TierEnum) =>
  rule(`isViewerOnOrg-${orgIdDotPath}-${requiredTier}`, {cache: 'strict'})(
    async (source, args, {dataLoader}: GQLContext) => {
      const orgId = getResolverDotPath(orgIdDotPath, source, args)
      const organization = await dataLoader.get('organizations').load(orgId)
      if (!organization) return new Error('Organization not found')
      const {tier} = organization
      if (tier !== requiredTier) return new Error(`Organization is not ${requiredTier}`)
      return true
    }
  )
