import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import getKysely from '../../../postgres/getKysely'
import getPhase from '../../../utils/getPhase'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const dragTeamHealthResultStage: MutationResolvers['dragTeamHealthResultStage'] = async (
  _source,
  {meetingId, stageId, sortOrder},
  {dataLoader, socketId: mutatorId}
) => {
  const pg = getKysely()
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
  const {phases, teamId, meetingType} = meeting
  if (meetingType !== 'teamHealth') {
    throw new GraphQLError('Not a team health meeting')
  }
  const resultPhase = getPhase(phases, 'TEAM_HEALTH_RESULT')
  const draggedStage = resultPhase.stages.find((stage) => stage.id === stageId)
  if (!draggedStage) {
    throw new GraphQLError('Invalid stageId provided')
  }

  draggedStage.sortOrder = sortOrder
  resultPhase.stages.sort((a, b) => (a.sortOrder > b.sortOrder ? 1 : -1))
  await pg
    .updateTable('NewMeeting')
    .set({phases: JSON.stringify(phases)})
    .where('id', '=', meetingId)
    .execute()
  dataLoader.clearAll('newMeetings')

  const data = {meetingId, teamId, stage: {...draggedStage, meetingId, teamId}}
  publish(
    SubscriptionChannel.MEETING,
    meetingId,
    'DragTeamHealthResultStageSuccess',
    data,
    subOptions
  )
  return data
}

export default dragTeamHealthResultStage
