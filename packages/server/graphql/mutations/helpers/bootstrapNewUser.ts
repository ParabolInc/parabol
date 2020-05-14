import sleep from 'parabol-client/utils/sleep'
import shortid from 'shortid'
import getRethink from '../../../database/rethinkDriver'
import AuthToken from '../../../database/types/AuthToken'
import SuggestedActionCreateNewTeam from '../../../database/types/SuggestedActionCreateNewTeam'
import SuggestedActionInviteYourTeam from '../../../database/types/SuggestedActionInviteYourTeam'
import SuggestedActionTryTheDemo from '../../../database/types/SuggestedActionTryTheDemo'
import TimelineEventJoinedParabol from '../../../database/types/TimelineEventJoinedParabol'
import User from '../../../database/types/User'
import segmentIo from '../../../utils/segmentIo'
import sendSegmentEvent, {sendSegmentIdentify} from '../../../utils/sendSegmentEvent'
import addSeedTasks from './addSeedTasks'
import createNewOrg from './createNewOrg'
import createTeamAndLeader from './createTeamAndLeader'

// no waiting necessary, it's just analytics
const handleSegment = async (
  isInvited: boolean,
  userId: string,
  previousId: string | null | undefined
) => {
  if (previousId) {
    await segmentIo.alias({previousId, userId})
    // https://segment.com/docs/destinations/mixpanel/#aliasing-server-side
    await sleep(1000)
  }
  sendSegmentEvent('Account Created', userId, {isInvited})
  return sendSegmentIdentify(userId)
}

const bootstrapNewUser = async (newUser: User, isOrganic: boolean, segmentId?: string | null) => {
  const {id: userId, preferredName} = newUser
  const r = await getRethink()
  const joinEvent = new TimelineEventJoinedParabol({userId})
  await r({
    user: r.table('User').insert(newUser),
    event: r.table('TimelineEvent').insert(joinEvent)
  }).run()

  const tms = [] as string[]
  if (isOrganic) {
    const orgId = shortid.generate()
    const teamId = shortid.generate()
    tms.push(teamId) // MUTATIVE
    const validNewTeam = {
      id: teamId,
      orgId,
      name: `${preferredName}’s Team`,
      isOnboardTeam: true
    }
    const orgName = `${newUser.preferredName}’s Org`
    await createNewOrg(orgId, orgName, userId)
    await Promise.all([
      createTeamAndLeader(userId, validNewTeam),
      addSeedTasks(userId, teamId),
      r
        .table('SuggestedAction')
        .insert(new SuggestedActionInviteYourTeam({userId, teamId}))
        .run()
    ])
    sendSegmentEvent('New Org', userId, {teamId, orgId, fromSignup: true})
  } else {
    await r
      .table('SuggestedAction')
      .insert([new SuggestedActionTryTheDemo({userId}), new SuggestedActionCreateNewTeam({userId})])
      .run()
  }
  handleSegment(!isOrganic, userId, segmentId).catch()

  return new AuthToken({sub: userId, tms})
}

export default bootstrapNewUser
