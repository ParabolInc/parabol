import getPg from '../getPg'
import {
  IRestartMeetingSeriesByIdQueryParams,
  restartMeetingSeriesByIdQuery
} from './generated/restartMeetingSeriesByIdQuery'

const restartMeetingSeries = async (
  update: Partial<IRestartMeetingSeriesByIdQueryParams>,
  id: number
) => {
  return restartMeetingSeriesByIdQuery.run(
    {
      ...update,
      id
    } as any,
    getPg()
  )
}

export default restartMeetingSeries
