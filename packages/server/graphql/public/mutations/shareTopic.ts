import DiscussStage from '../../../database/types/DiscussStage'
import {getUserId, isTeamMember} from '../../../utils/authorization'
import getPhase from '../../../utils/getPhase'
import standardError from '../../../utils/standardError'
import {SlackNotifier} from '../../mutations/helpers/notifications/SlackNotifier'
import {MutationResolvers} from '../resolverTypes'

const shareTopic: MutationResolvers['shareTopic'] = async (
  _source,
  {stageId, meetingId, channelId},
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)
  const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
  const {teamId} = meeting

  if (!isTeamMember(authToken, teamId)) {
    return standardError(new Error('Team not found'), {userId: viewerId})
  }

  let stage = null
  let stageIndex = -1

  const discussPhase = getPhase(meeting.phases, 'discuss')

  if (discussPhase) {
    stageIndex = discussPhase.stages.findIndex((possibleStage) => possibleStage.id === stageId)
    stage = discussPhase.stages[stageIndex]
  }

  if (stage === null) {
    return standardError(new Error('Stage not found'), {userId: viewerId})
  }

  const {reflectionGroupId} = stage as DiscussStage

  const res = await SlackNotifier.shareTopic?.(
    dataLoader,
    viewerId,
    teamId,
    meetingId,
    reflectionGroupId,
    stageIndex,
    channelId
  )

  if (typeof res === 'object' && 'error' in res) {
    return standardError(
      new Error('Error sharing topic. If the problem persists, please re-integrate'),
      {userId: viewerId}
    )
  }

  const data = {meetingId}
  return data
}

export default shareTopic
