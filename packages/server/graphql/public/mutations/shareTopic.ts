import {GraphQLError} from 'graphql'
import type DiscussStage from '../../../database/types/DiscussStage'
import {getUserId} from '../../../utils/authorization'
import getPhase from '../../../utils/getPhase'
import {SlackNotifier} from '../../mutations/helpers/notifications/SlackNotifier'
import type {MutationResolvers} from '../resolverTypes'

const shareTopic: MutationResolvers['shareTopic'] = async (
  _source,
  {stageId, meetingId, channelId},
  {authToken, dataLoader}
) => {
  const viewerId = getUserId(authToken)
  const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
  const {teamId} = meeting

  let stage = null
  let stageIndex = -1

  const discussPhase = getPhase(meeting.phases, 'discuss')

  if (discussPhase) {
    stageIndex = discussPhase.stages.findIndex((possibleStage) => possibleStage.id === stageId)
    stage = discussPhase.stages[stageIndex]
  }

  if (stage === null) {
    throw new GraphQLError('Stage not found', {extensions: {code: 'NOT_FOUND'}})
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
    throw new GraphQLError('Error sharing topic. If the problem persists, please re-integrate', {
      extensions: {code: 'SERVICE_UNAVAILABLE'}
    })
  }

  const data = {meetingId}
  return data
}

export default shareTopic
