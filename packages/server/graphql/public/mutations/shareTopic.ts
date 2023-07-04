import {getUserId, isTeamMember} from '../../../utils/authorization'
import standardError from '../../../utils/standardError'
import {SlackNotifier} from '../../mutations/helpers/notifications/SlackNotifier'
import {MutationResolvers} from '../resolverTypes'
import DiscussStage from '../../../database/types/DiscussStage'

const shareTopic: MutationResolvers['shareTopic'] = async (
  _source,
  {stageId, meetingId, channelId},
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)
  const meeting = await dataLoader.get('newMeetings').load(meetingId)
  const {teamId} = meeting

  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }

  let stage = null
  for (const phase of meeting.phases) {
    if (phase.phaseType === 'discuss') {
      for (const possibleStage of phase.stages) {
        if (possibleStage.id === stageId) {
          stage = possibleStage
        }
      }
    }
  }

  if (stage === null) {
    return standardError(new Error('Stage not found'), {userId: viewerId})
  }

  const {reflectionGroupId} = stage as DiscussStage

  SlackNotifier.shareTopic?.(dataLoader, viewerId, teamId, meetingId, reflectionGroupId, channelId)

  const data = {meetingId}
  return data
}

export default shareTopic
