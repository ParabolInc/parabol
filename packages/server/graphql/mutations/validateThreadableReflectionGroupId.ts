import {ThreadSourceEnum, MeetingTypeEnum} from 'parabol-client/types/graphql'
import {DataLoaderWorker} from '../graphql'

const validateThreadableReflectionGroupId = async (
  threadSource: ThreadSourceEnum | null,
  threadId: string | null | undefined,
  meetingId: string | null | undefined,
  dataLoader: DataLoaderWorker
) => {
  if (!meetingId)
    return undefined

  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  switch (meeting.meetingType) {
    case MeetingTypeEnum.retrospective:
      const reflectionGroupId =
        threadSource === ThreadSourceEnum.REFLECTION_GROUP ? threadId : undefined
      if (reflectionGroupId) {
        const reflectionGroup = await dataLoader.get('retroReflectionGroups').load(reflectionGroupId)
        if (!reflectionGroup || reflectionGroup.meetingId !== meetingId)
          return 'Invalid reflection group ID. ef yeah'
      }
      break
    case MeetingTypeEnum.action:
      // TODO: add validation for action items here, plus change filename
      // if agendaItem has meetingId on it, this becomes trivial and can be generic
      break
  }
  return undefined
}

export default validateThreadableReflectionGroupId
