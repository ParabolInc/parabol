import type {PageAccessTeamResolvers} from '../resolverTypes'

const PageAccessTeam: PageAccessTeamResolvers = {
  team: async ({teamId}, _args, {dataLoader}) => {
    const team = await dataLoader.get('teams').loadNonNull(teamId)
    return {
      ...team,
      id: `preview:${team.id}`
    }
  }
}

export default PageAccessTeam
