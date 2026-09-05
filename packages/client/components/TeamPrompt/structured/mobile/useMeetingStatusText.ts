import useTimeLeftLabel from '~/hooks/useTimeLeftLabel'

const useMeetingStatusText = (
  endedAt: string | null | undefined,
  scheduledEndTime: string | null | undefined
) => {
  const timeLeft = useTimeLeftLabel(scheduledEndTime)
  if (endedAt) return 'Ended'
  return timeLeft
}

export default useMeetingStatusText
