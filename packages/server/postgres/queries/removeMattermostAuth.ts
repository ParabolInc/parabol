import getPg from '../getPg'
import {removeMattermostAuthQuery} from './generated/removeMattermostAuthQuery'

const removeMattermostAuth = async (userId: string, teamId: string) => {
  await removeMattermostAuthQuery.run({userId, teamId}, getPg())
}
export default removeMattermostAuth
