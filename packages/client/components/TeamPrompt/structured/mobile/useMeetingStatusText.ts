import useTimeLeftLabel from '~/hooks/useTimeLeftLabel'

const useMeetingStatusText = (
  endedAt: string | null | undefined,
  scheduledEndTime: string | null | undefined
) => {
  const timeLeft = useTimeLeftLabel(scheduledEndTime, !endedAt)
  return endedAt ? 'Ended' : timeLeft
}

export default useMeetingStatusText
