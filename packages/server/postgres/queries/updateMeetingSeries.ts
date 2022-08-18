import getPg from '../getPg'
import {
  IUpdateMeetingSeriesByIdQueryParams,
  updateMeetingSeriesByIdQuery
} from './generated/updateMeetingSeriesByIdQuery'

const updateMeetingSeries = async (
  update: Partial<IUpdateMeetingSeriesByIdQueryParams>,
  id: number
) => {
  return updateMeetingSeriesByIdQuery.run(
    {
      ...update,
      id
    } as any,
    getPg()
  )
}

export default updateMeetingSeries
