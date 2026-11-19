import type {Orgaiappspolicyenum} from '../postgres/types/pg'

interface OrgPolicy {
  aiAppsPolicy: Orgaiappspolicyenum | null
  useAI: boolean
}

const isAIAppAllowedByOrg = (org: OrgPolicy, provider: {verifiedAt: Date | null}) => {
  const policy = org.aiAppsPolicy ?? (org.useAI ? 'all' : 'none')
  if (policy === 'all') return true
  if (policy === 'verified') return !!provider.verifiedAt
  return false
}

export default isAIAppAllowedByOrg
