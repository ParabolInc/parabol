import type {PageAccessTeamResolvers} from '../resolverTypes'

const PageAccessTeam: PageAccessTeamResolvers = {
  team: ({teamId}, _args, {dataLoader}) => dataLoader.get('teams').loadNonNull(teamId)
}

export default PageAccessTeam
