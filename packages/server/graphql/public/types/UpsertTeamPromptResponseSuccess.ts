import isValid from '../../../graphql/isValid'
import {UpsertTeamPromptResponseSuccessResolvers} from '../resolverTypes'

export type UpsertTeamPromptResponseSuccessSource = {
  teamPromptResponseId: string
  meetingId: string
  addedKudosesIds?: number[]
}

const UpsertTeamPromptResponseSuccess: UpsertTeamPromptResponseSuccessResolvers = {
  teamPromptResponse: async (source, _args, {dataLoader}) => {
    const {teamPromptResponseId} = source
    return dataLoader.get('teamPromptResponses').loadNonNull(teamPromptResponseId)
  },
  meeting: async (source, _args, {dataLoader}) => {
    const {meetingId} = source
    return dataLoader.get('newMeetings').load(meetingId)
  },
  addedKudoses: async (source, _args, {dataLoader}) => {
    const {addedKudosesIds} = source
    if (!addedKudosesIds) {
      return null
    }

    return (await dataLoader.get('kudoses').loadMany(addedKudosesIds)).filter(isValid)
  }
}

export default UpsertTeamPromptResponseSuccess
