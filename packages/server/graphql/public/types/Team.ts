import {TeamResolvers} from '../resolverTypes'

const Team: TeamResolvers = {
  activeMeetingSeries: async ({id: teamId}, _args, {dataLoader, authToken}) => {
    const meetingSeries = await dataLoader.get('meetingSeriesByTeamIds').load(teamId)
    return meetingSeries
  }
}

export default Team
