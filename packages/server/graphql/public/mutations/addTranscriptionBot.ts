import {isTeamMember} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import addRecallBot from '../../mutations/helpers/addRecallBot'
import {MutationResolvers} from '../resolverTypes'

const addTranscriptionBot: MutationResolvers['addTranscriptionBot'] = async (
  _source,
  {teamId, videoMeetingURL},
  {authToken, dataLoader}
) => {
  if (!isTeamMember(authToken, teamId)) {
    const error = new Error('Not on team')
    return standardError(error)
  }
  const meetingSettingsId = await addRecallBot(teamId, videoMeetingURL, dataLoader)
  if (!meetingSettingsId) {
    const error = new Error('Unable to add transcription bot')
    return standardError(error)
  }

  return {meetingSettingsId}
}

export default addTranscriptionBot
