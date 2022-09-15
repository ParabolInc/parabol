import getPg from '../getPg'
import catchAndLog from '../utils/catchAndLog'
import {getUserIdsToPauseQuery} from './generated/getUserIdsToPauseQuery'

const getUserIdsToPause = async (activeThreshold: Date): Promise<string[]> => {
  return (
    (await catchAndLog(async () =>
      (await getUserIdsToPauseQuery.run({activeThreshold}, getPg())).map((user) => user.id)
    )) ?? []
  )
}

export default getUserIdsToPause
