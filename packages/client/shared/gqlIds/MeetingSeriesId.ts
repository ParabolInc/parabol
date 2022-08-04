const MeetingSeriesId = {
  join: (meetingSeriesId: number) => `meetingSeries:${meetingSeriesId}`,
  split: (id: string) => {
    const [, meetingSeriesId] = id.split(':')
    return Number(meetingSeriesId)
  }
}

export default MeetingSeriesId
