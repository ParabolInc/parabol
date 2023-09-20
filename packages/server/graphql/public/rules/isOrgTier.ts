import {rule} from 'graphql-shield'
import {GQLContext} from '../../graphql'
import {TierEnum} from '../resolverTypes'

const resolve = async (requiredTier: TierEnum, orgId: string, {dataLoader}: GQLContext) => {
  const organization = await dataLoader.get('organizations').load(orgId)
  if (!organization) return new Error('Organization not found')
  const {tier} = organization
  if (tier !== requiredTier) return new Error(`Organization is not ${requiredTier}`)
  return true
}

export const isOrgTierSource = (requiredTier: TierEnum) =>
  rule(`isOrgTierSource-${requiredTier}`, {cache: 'strict'})(
    async ({id: orgId}, _args, context: GQLContext) => {
      return resolve(requiredTier, orgId, context)
    }
  )

export const isOrgTier = (requiredTier: TierEnum) =>
  rule(`isOrgTier-${requiredTier}`, {cache: 'strict'})(
    async (_source, {orgId}, context: GQLContext) => {
      return resolve(requiredTier, orgId, context)
    }
  )
