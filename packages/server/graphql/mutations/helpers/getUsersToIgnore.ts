import {redisHocusPocus} from '../../../hocusPocus'

// finds all the users who are at the same url
const getUsersToIgnore = async (meetingId: string | null | undefined) => {
  if (!meetingId) return []
  const documentName = `meeting:${meetingId}`
  const usersInMeeting = await redisHocusPocus.handleEvent(
    'fetchUserIdsInSameMeeting',
    documentName,
    {}
  )
  return usersInMeeting
}

export default getUsersToIgnore
