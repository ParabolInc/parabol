import {isTeamMember} from '../../../utils/authorization'
import addRecallBot from '../../mutations/helpers/addRecallBot'
import {MutationResolvers} from '../resolverTypes'

const addTranscriptionBot: MutationResolvers['addTranscriptionBot'] = async (
  _source,
  {teamId, videoMeetingURL},
  {authToken, dataLoader}
) => {
  if (!isTeamMember(authToken, teamId)) {
    return {error: {message: 'Not on team'}}
  }
  await addRecallBot(teamId, videoMeetingURL, dataLoader)
  return true
}

export default addTranscriptionBot
