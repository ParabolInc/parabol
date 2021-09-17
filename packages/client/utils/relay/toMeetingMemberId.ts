const toMeetingMemberId = ({userId, meetingId}: {userId: string; meetingId: string}) =>
  `${userId}::${meetingId}`

export default toMeetingMemberId
