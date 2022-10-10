import getRethink from '../../../database/rethinkDriver'
import AuthToken from '../../../database/types/AuthToken'
import SuggestedActionCreateNewTeam from '../../../database/types/SuggestedActionCreateNewTeam'
import SuggestedActionInviteYourTeam from '../../../database/types/SuggestedActionInviteYourTeam'
import SuggestedActionTryTheDemo from '../../../database/types/SuggestedActionTryTheDemo'
import TimelineEventJoinedParabol from '../../../database/types/TimelineEventJoinedParabol'
import User from '../../../database/types/User'
import generateUID from '../../../generateUID'
import insertUser from '../../../postgres/queries/insertUser'
import IUser from '../../../postgres/types/IUser'
import {analytics} from '../../../utils/analytics/analytics'
import segmentIo from '../../../utils/segmentIo'
import addSeedTasks from './addSeedTasks'
import createNewOrg from './createNewOrg'
import createTeamAndLeader from './createTeamAndLeader'
import isPatientZero from './isPatientZero'

const bootstrapNewUser = async (newUser: User, isOrganic: boolean) => {
  const {id: userId, createdAt, preferredName, email, featureFlags, tier, segmentId} = newUser
  const domain = email.split('@')[1]
  const isPatient0 = await isPatientZero(userId, domain)
  const r = await getRethink()
  const joinEvent = new TimelineEventJoinedParabol({userId})

  await Promise.all([
    r({
      user: r.table('User').insert(newUser),
      event: r.table('TimelineEvent').insert(joinEvent)
    }).run(),
    insertUser(newUser)
  ])

  // Identify the user so user properties are set before any events are sent
  segmentIo.identify({
    userId,
    traits: {
      createdAt,
      email,
      name: preferredName,
      isActive: true,
      featureFlags,
      highestTier: tier,
      isPatient0
    },
    anonymousId: segmentId
  })

  const tms = [] as string[]
  if (isOrganic) {
    const orgId = generateUID()
    const teamId = generateUID()
    tms.push(teamId) // MUTATIVE
    const validNewTeam = {
      id: teamId,
      orgId,
      name: `${preferredName}’s Team`,
      isOnboardTeam: true
    }
    const orgName = `${newUser.preferredName}’s Org`
    await createNewOrg(orgId, orgName, userId, email)
    await Promise.all([
      createTeamAndLeader(newUser as IUser, validNewTeam),
      addSeedTasks(userId, teamId),
      r.table('SuggestedAction').insert(new SuggestedActionInviteYourTeam({userId, teamId})).run()
    ])
    segmentIo.track({
      userId,
      event: 'New Org',
      properties: {
        teamId,
        orgId,
        fromSignup: true
      }
    })
  } else {
    await r
      .table('SuggestedAction')
      .insert([new SuggestedActionTryTheDemo({userId}), new SuggestedActionCreateNewTeam({userId})])
      .run()
  }
  analytics.accountCreated(userId, !isOrganic, isPatient0)

  return new AuthToken({sub: userId, tms})
}

export default bootstrapNewUser
