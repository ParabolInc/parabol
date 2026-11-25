import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {getNewDataLoader} from '../../../dataloader/getNewDataLoader'
import publish from '../../../utils/publish'
import getRetroTeamHealthStage from './getRetroTeamHealthStage'

// the running retros that show a check are told to read it again when it's attached to one of them
// or reveals its results. Teammates who never opened Team Health aren't members of the check, so the
// retro's own channel is how they hear. Detached from the caller, so it reads through a loader of
// its own
const syncRetrosWithTeamHealthCheck = async (teamHealthMeetingId: string) => {
  const dataLoader = getNewDataLoader('syncRetrosWithTeamHealthCheck')
  try {
    const teamHealthMeeting = await dataLoader.get('newMeetings').load(teamHealthMeetingId)
    if (!teamHealthMeeting) return
    const activeMeetings = await dataLoader
      .get('activeMeetingsByTeamId')
      .load(teamHealthMeeting.teamId)
    const retros = activeMeetings.filter(
      ({meetingType, phases}) =>
        meetingType === 'retrospective' &&
        getRetroTeamHealthStage(phases)?.teamHealthMeetingId === teamHealthMeetingId
    )
    if (retros.length === 0) return
    const operationId = dataLoader.share()
    retros.forEach(({id: meetingId}) => {
      // no mutatorId: whoever attached or ended the check gets no retro back from their own mutation
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
