const MeetingMemberId = {
  join: ({meetingId, userId}: {meetingId: string; userId: string}) => `${userId}::${meetingId}`,
  split: ({id}: {id: string}) => {
    const [userId, meetingId] = id.split('::')
    return {meetingId, userId}
  }
}

export default MeetingMemberId
