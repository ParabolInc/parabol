interface RankableService {
  isConnected: boolean
}

/** The viewer's connected services first, then the rest; each group by how much the org uses it */
const rankServicesByOrgUse = <T extends RankableService>(
  services: readonly T[],
  orgServices: readonly string[],
  getService: (service: T) => string
) => {
  const orgUsageRank = (service: T) => {
    const rank = orgServices.indexOf(getService(service))
    return rank < 0 ? orgServices.length : rank
  }
  const byOrgUse = [...services].sort((a, b) => orgUsageRank(a) - orgUsageRank(b))
  return {
    connected: byOrgUse.filter(({isConnected}) => isConnected),
    unconnected: byOrgUse.filter(({isConnected}) => !isConnected)
  }
}

export default rankServicesByOrgUse
