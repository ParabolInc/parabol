const toSearchQueryId = (
  meetingPropName: string,
  meetingId: string
) => `${meetingPropName}:${meetingId}`

export default toSearchQueryId
