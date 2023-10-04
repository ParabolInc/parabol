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
import addSeedTasks from './addSeedTasks'
import createNewOrg from './createNewOrg'
import createTeamAndLeader from './createTeamAndLeader'
import getUsersbyDomain from '../../../postgres/queries/getUsersByDomain'
import sendPromptToJoinOrg from '../../../utils/sendPromptToJoinOrg'
import {makeDefaultTeamName} from 'parabol-client/utils/makeDefaultTeamName'
import {DataLoaderWorker} from '../../graphql'

const bootstrapNewUser = async (
  newUser: User,
  isOrganic: boolean,
  dataLoader: DataLoaderWorker,
  searchParams?: string
) => {
  const r = await getRethink()
  const {id: userId, createdAt, preferredName, email, featureFlags, tier, segmentId} = newUser
  // email is checked by the caller
  const domain = email.split('@')[1]!
  const isCompanyDomain = await dataLoader.get('isCompanyDomain').load(domain)
  const usersWithDomain = isCompanyDomain ? await getUsersbyDomain(domain) : []
  const isPatient0 = !!domain && isCompanyDomain && usersWithDomain.length === 0

  const joinEvent = new TimelineEventJoinedParabol({userId})

  const experimentalFlags = [...featureFlags]

  const domainUserHasRidFlag = usersWithDomain.some((user) =>
    user.featureFlags.includes('retrosInDisguise')
  )
  const params = new URLSearchParams(searchParams)
  if (Boolean(params.get('rid')) || domainUserHasRidFlag) {
    experimentalFlags.push('retrosInDisguise')
  } else if (usersWithDomain.length === 0) {
    experimentalFlags.push('retrosInDisguise')
  }

  await Promise.all([
    r({
      event: r.table('TimelineEvent').insert(joinEvent)
    }).run(),
    insertUser({...newUser, isPatient0, featureFlags: experimentalFlags})
  ])

  // Identify the user so user properties are set before any events are sent
  analytics.identify({
    userId,
    createdAt,
    email,
    name: preferredName,
    isActive: true,
    featureFlags: experimentalFlags,
    highestTier: tier,
    isPatient0,
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
      name: makeDefaultTeamName(teamId),
      isOnboardTeam: true
    }
    const orgName = `${newUser.preferredName}’s Org`
    await createNewOrg(orgId, orgName, userId, email, dataLoader)
    await Promise.all([
      createTeamAndLeader(newUser as IUser, validNewTeam),
      addSeedTasks(userId, teamId),
      r.table('SuggestedAction').insert(new SuggestedActionInviteYourTeam({userId, teamId})).run()
    ])
    analytics.newOrg(userId, orgId, teamId, true)
  } else {
    await r
      .table('SuggestedAction')
      .insert([new SuggestedActionTryTheDemo({userId}), new SuggestedActionCreateNewTeam({userId})])
      .run()
  }
  analytics.accountCreated(userId, !isOrganic, isPatient0)

  if (isOrganic) {
    sendPromptToJoinOrg(newUser, dataLoader)
  }

  return new AuthToken({sub: userId, tms})
}

export default bootstrapNewUser
