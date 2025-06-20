export function createMeetingSeriesTitle(
  meetingSeriesName: string,
  endTime: Date | null | undefined,
  timeZone?: string
) {
  if (!endTime) {
    return meetingSeriesName
  }
  const formattedDate = endTime.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone
  })

  return `${meetingSeriesName} - ends ${formattedDate}`
}
