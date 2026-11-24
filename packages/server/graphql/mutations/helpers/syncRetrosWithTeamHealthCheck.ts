import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {getNewDataLoader} from '../../../dataloader/getNewDataLoader'
import publish from '../../../utils/publish'
import getRetroTeamHealthStage from './getRetroTeamHealthStage'

// a retro resolves its team's check live, so whenever a check opens or ends, the team's running
// retros are told to read it again. Detached from the caller, so it reads through a loader of its own
const syncRetrosWithTeamHealthCheck = async (teamId: string) => {
  const dataLoader = getNewDataLoader('syncRetrosWithTeamHealthCheck')
  try {
    const activeMeetings = await dataLoader.get('activeMeetingsByTeamId').load(teamId)
    const retros = activeMeetings.filter(
      ({meetingType, phases}) => meetingType === 'retrospective' && getRetroTeamHealthStage(phases)
    )
    if (retros.length === 0) return
    const operationId = dataLoader.share()
    retros.forEach(({id: meetingId}) => {
      // no mutatorId: whoever opened or ended the check gets no retro back from their own mutation
      publish(
        SubscriptionChannel.MEETING,
        meetingId,
        'RetroTeamHealthCheckPayload',
        {meetingId},
        {operationId}
      )
    })
  } finally {
    dataLoader.dispose()
  }
}

export default syncRetrosWithTeamHealthCheck
