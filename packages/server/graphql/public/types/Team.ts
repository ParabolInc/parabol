import {TeamResolvers} from '../resolverTypes'
import TeamInsightsId from 'parabol-client/shared/gqlIds/TeamInsightsId'

const Team: TeamResolvers = {
  insights: async ({id, orgId, mostUsedEmojis}, _args, {dataLoader}) => {
    const org = await dataLoader.get('organizations').load(orgId)
    if (!org?.featureFlags?.includes('teamInsights')) return null
    if (!mostUsedEmojis) return null

    return {
      id: TeamInsightsId.join(id),
      mostUsedEmojis
    } as any
  }
}

export default Team
