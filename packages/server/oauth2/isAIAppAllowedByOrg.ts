import type {Orgaiappspolicyenum} from '../postgres/types/pg'

interface OrgPolicy {
  aiAppsPolicy: Orgaiappspolicyenum | null
  useAI: boolean
}

export const getEffectiveAIAppsPolicy = (org: OrgPolicy): Orgaiappspolicyenum =>
  org.aiAppsPolicy ?? (org.useAI ? 'all' : 'none')

const isAIAppAllowedByOrg = (org: OrgPolicy, provider: {verifiedAt: Date | null}) => {
  const policy = getEffectiveAIAppsPolicy(org)
  return policy === 'all' || (policy === 'verified' && !!provider.verifiedAt)
}

export default isAIAppAllowedByOrg
