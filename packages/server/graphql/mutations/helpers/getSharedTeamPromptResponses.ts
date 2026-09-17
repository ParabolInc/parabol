import type {DataLoaderInstance} from '../../../dataloader/RootDataLoader'
import {hasSharedContent} from '../../public/mutations/helpers/buildTeamPromptResponseContent'

const getSharedTeamPromptResponses = async (meetingId: string, dataLoader: DataLoaderInstance) => {
  const responses = await dataLoader.get('teamPromptResponsesByMeetingId').load(meetingId)
  return responses.filter(hasSharedContent)
}

export default getSharedTeamPromptResponses
