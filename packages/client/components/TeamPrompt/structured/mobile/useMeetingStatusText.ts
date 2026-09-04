import useRefreshInterval from '~/hooks/useRefreshInterval'
import {humanReadableCountdown} from '~/utils/date/relativeDate'

const useMeetingStatusText = (
  endedAt: string | null | undefined,
  scheduledEndTime: string | null | undefined
) => {
  useRefreshInterval(1000)
  if (endedAt) return 'Ended'
  if (!scheduledEndTime) return null
  const fromNow = humanReadableCountdown(scheduledEndTime)
  return fromNow ? `${fromNow} left` : null
}

export default useMeetingStatusText
