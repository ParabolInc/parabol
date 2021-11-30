import getPg from '../postgres/getPg'
import {appendUserTmsQuery} from '../postgres/queries/generated/appendUserTmsQuery'

const addTeamIdToTMS = async (userId: string, teamId: string) => {
  return appendUserTmsQuery.run({id: userId, teamId}, getPg())
}

export default addTeamIdToTMS
