import getPg from '../getPg'
import {
  type IRestartMeetingSeriesByIdQueryParams,
  restartMeetingSeriesByIdQuery
} from './generated/restartMeetingSeriesByIdQuery'

const restartMeetingSeries = async (
  id: number,
  update?: Partial<IRestartMeetingSeriesByIdQueryParams>
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
