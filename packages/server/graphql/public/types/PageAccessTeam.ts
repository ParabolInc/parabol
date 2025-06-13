import {PageAccessTeamResolvers} from '../resolverTypes'

const PageAccessTeam: PageAccessTeamResolvers = {
  team: async ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default PageAccessTeam
