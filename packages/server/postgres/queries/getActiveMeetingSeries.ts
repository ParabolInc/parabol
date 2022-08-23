import getPg from '../getPg'
import {getActiveMeetingSeriesQuery} from './generated/getActiveMeetingSeriesQuery'

export const getActiveMeetingSeries = async () => {
  return await getActiveMeetingSeriesQuery.run(undefined, getPg())
}
