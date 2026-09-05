import {humanReadableCountdown} from '../utils/date/relativeDate'
import useRefreshInterval from './useRefreshInterval'

const useTimeLeftLabel = (meetingEndTime: string | null | undefined, enabled = true) => {
  useRefreshInterval(1000, enabled)
  if (!enabled || !meetingEndTime) return null
  const fromNow = humanReadableCountdown(meetingEndTime)
  return fromNow ? `${fromNow} left` : null
}

export default useTimeLeftLabel
