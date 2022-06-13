import {rule} from 'graphql-shield'
import {GQLContext} from '../../graphql'
import {TierEnum} from '../resolverTypes'

const isOrgTier = (requiredTier: TierEnum) =>
  rule({cache: 'strict'})(async (_source, {orgId}, {dataLoader}: GQLContext) => {
    const organization = await dataLoader.get('organizations').load(orgId)
    if (!organization) return new Error('Organization not found')
    const {tier} = organization
    if (tier !== requiredTier) return new Error(`Organization is not ${requiredTier}`)
    return true
  })

export default isOrgTier
