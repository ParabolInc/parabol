import type {TierEnum} from '../../__generated__/ReportsRedirectQuery.graphql'

interface ReportsOrg {
  id: string
  tier: TierEnum
  createdAt: string
}

const TIER_RANK: Record<TierEnum, number> = {enterprise: 0, team: 1, starter: 2}

const pickReportsOrg = <T extends ReportsOrg>(
  organizations: readonly T[],
  storedOrgId: string | null
) => {
  const storedOrg = organizations.find(({id}) => id === storedOrgId)
  if (storedOrg) return storedOrg
  return organizations
    .slice()
    .sort(
      (a, b) =>
        TIER_RANK[a.tier] - TIER_RANK[b.tier] ||
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )[0]
}

export default pickReportsOrg
