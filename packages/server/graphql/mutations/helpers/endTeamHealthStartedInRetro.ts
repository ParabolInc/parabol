import type {GraphQLResolveInfo} from 'graphql'
import {getNewDataLoader} from '../../../dataloader/getNewDataLoader'
import type {RetrospectiveMeeting} from '../../../postgres/types/Meeting'
import type {InternalContext} from '../../graphql'
import getRetroTeamHealthStage from './getRetroTeamHealthStage'
import safeEndTeamHealth from './safeEndTeamHealth'

// a check the retro started belongs to that retro, so it reveals when the retro ends. Ending publishes
// a snapshot of its loader, so it reads through one of its own rather than the retro's spent one
const endTeamHealthStartedInRetro = async (
  retro: RetrospectiveMeeting,
  context: InternalContext,
  info: GraphQLResolveInfo
) => {
  const startedTeamHealthMeetingId = getRetroTeamHealthStage(
    retro.phases
  )?.startedTeamHealthMeetingId
  if (!startedTeamHealthMeetingId) return
  const dataLoader = getNewDataLoader('endTeamHealthStartedInRetro')
  try {
    const teamHealthMeeting = await dataLoader.get('newMeetings').load(startedTeamHealthMeetingId)
    if (teamHealthMeeting?.meetingType !== 'teamHealth' || teamHealthMeeting.endedAt) return
    // everyone hears the reveal, including whoever ended the retro
    const endContext = {...context, dataLoader, socketId: undefined}
    await safeEndTeamHealth({meeting: teamHealthMeeting, context: endContext, info})
  } finally {
    dataLoader.dispose()
  }
}

export default endTeamHealthStartedInRetro
