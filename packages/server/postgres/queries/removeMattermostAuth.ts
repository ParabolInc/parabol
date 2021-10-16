import getPg from '../getPg'
import {removeMattermostAuthQuery} from './generated/removeMattermostAuthQuery'

const removeAtlassianAuth = async (teamId: string) => {
  await removeMattermostAuthQuery.run({teamId}, getPg())
}
export default removeAtlassianAuth
