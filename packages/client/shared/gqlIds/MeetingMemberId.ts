const MeetingMemberId = {
  join: (meetingId: string, userId: string) => `${userId}::${meetingId}`,
  split: (id: string) => {
    const [userId, meetingId] = id.split('::')
    return {meetingId, userId}
  }
}

export default MeetingMemberId
