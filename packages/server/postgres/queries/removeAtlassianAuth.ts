import getPg from '../getPg'
import {removeAtlassianAuthQuery} from './generated/removeAtlassianAuthQuery'

const removeAtlassianAuth = async (userId: string, teamId: string) => {
  await removeAtlassianAuthQuery.run({userId, teamId}, getPg())
}
export default removeAtlassianAuth
