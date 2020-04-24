import {ThreadSourceEnum} from 'parabol-client/types/graphql'
import {DataLoaderWorker} from '../graphql'

const validateThreadableReflectionGroupId = async (
  threadSource: ThreadSourceEnum | null,
  threadId: string | null | undefined,
  meetingId: string | null | undefined,
  dataLoader: DataLoaderWorker
) => {
  const reflectionGroupId =
    threadSource === ThreadSourceEnum.REFLECTION_GROUP ? threadId : undefined
  if (reflectionGroupId) {
    const reflectionGroup = await dataLoader.get('retroReflectionGroups').load(reflectionGroupId)
    if (!reflectionGroup || reflectionGroup.meetingId !== meetingId) {
      return 'Invalid reflection group ID'
    }
  }
  return undefined
}

export default validateThreadableReflectionGroupId
