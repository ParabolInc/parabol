export function createMeetingSeriesTitle(
  meetingSeriesName: string,
  startTime: Date,
  timeZone: string
) {
  const formattedDate = startTime.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone
  })

  return `${meetingSeriesName} - ${formattedDate}`
}
