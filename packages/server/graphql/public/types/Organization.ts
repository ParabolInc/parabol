import {ExtractTypeFromQueryBuilderSelect} from '../../../../client/types/generics'
import {selectOrganizations} from '../../../dataloader/primaryKeyLoaderMakers'
import {isSuperUser} from '../../../utils/authorization'
import {getFeatureTier} from '../../types/helpers/getFeatureTier'
import {OrganizationResolvers} from '../resolverTypes'

export interface OrganizationSource
  extends ExtractTypeFromQueryBuilderSelect<typeof selectOrganizations> {}

const Organization: OrganizationResolvers = {
  approvedDomains: async ({id: orgId}, _args, {dataLoader}) => {
    return dataLoader.get('organizationApprovedDomainsByOrgId').load(orgId)
  },
  meetingStats: async ({id: orgId}, _args, {dataLoader}) => {
    return dataLoader.get('meetingStatsByOrgId').load(orgId)
  },
  teamStats: async ({id: orgId}, _args, {dataLoader}) => {
    return dataLoader.get('teamStatsByOrgId').load(orgId)
  },
  company: async ({activeDomain}, _args, {authToken}) => {
    if (!activeDomain || !isSuperUser(authToken)) return null
    return {id: activeDomain}
  },
  featureFlags: ({featureFlags}) => {
    if (!featureFlags) return {}
    return Object.fromEntries(featureFlags.map((flag) => [flag as any, true]))
  },
  picture: async ({picture}, _args, {dataLoader}) => {
    if (!picture) return null
    return dataLoader.get('fileStoreAsset').load(picture)
  },
  tier: ({tier, trialStartDate}) => {
    return getFeatureTier({tier, trialStartDate})
  },
  billingTier: ({tier}) => tier,
  saml: async ({id: orgId}, _args, {dataLoader}) => {
    const saml = await dataLoader.get('samlByOrgId').load(orgId)
    return saml || null
  }
}

export default Organization
