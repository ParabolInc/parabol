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
import isPatientZero from './isPatientZero'
import getUsersbyDomain from '../../../postgres/queries/getUsersByDomain'
import sendPromptToJoinOrg from '../../../utils/sendPromptToJoinOrg'
import {makeDefaultTeamName} from 'parabol-client/utils/makeDefaultTeamName'
import isCompanyDomain from '../../../utils/isCompanyDomain'
import {DataLoaderWorker} from '../../graphql'
import getTeamsByIds from '../../../postgres/queries/getTeamsByIds'
import acceptTeamInvitation from '../../../safeMutations/acceptTeamInvitation'

const bootstrapNewUser = async (
  newUser: User,
  isOrganic: boolean,
  dataLoader: DataLoaderWorker,
  searchParams?: string
) => {
  const r = await getRethink()
  const {
    id: userId,
    createdAt,
    preferredName,
    email,
    featureFlags,
    tier,
    segmentId,
    identities
  } = newUser
  // email is checked by the caller
  const domain = email.split('@')[1]!
  const [isPatient0, usersWithDomain] = await Promise.all([
    isPatientZero(domain),
    isCompanyDomain(domain) ? getUsersbyDomain(domain) : []
  ])

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

  const usersWithDomainTms = usersWithDomain.flatMap((user) => user.tms)
  const [teamsWithDomain] = await Promise.all([
    usersWithDomainTms.length > 0 ? getTeamsByIds(usersWithDomainTms) : [],
    insertUser({...newUser, isPatient0, featureFlags: experimentalFlags}),
    r({
      event: r.table('TimelineEvent').insert(joinEvent)
    }).run()
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
    const teamsWithAutoJoin = teamsWithDomain.filter(
      ({autoJoin, isArchived}) => autoJoin && !isArchived
    )
    const isVerified = identities.some((identity) => identity.isEmailVerified)
    if (isVerified && teamsWithAutoJoin.length > 0) {
      tms.push(...teamsWithAutoJoin.map(({id}) => id))
      await Promise.all(
        tms.map(async (teamId) => {
          const team = await dataLoader.get('teams').loadNonNull(teamId)
          return Promise.all([
            acceptTeamInvitation(team, userId, dataLoader),
            addSeedTasks(userId, teamId),
            r
              .table('SuggestedAction')
              .insert(new SuggestedActionInviteYourTeam({userId, teamId}))
              .run(),
            analytics.autoJoined(userId, teamId)
          ])
        })
      )
    } else {
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
      await createNewOrg(orgId, orgName, userId, email)
      await Promise.all([
        createTeamAndLeader(newUser as IUser, validNewTeam),
        addSeedTasks(userId, teamId),
        r.table('SuggestedAction').insert(new SuggestedActionInviteYourTeam({userId, teamId})).run()
      ])
      sendPromptToJoinOrg(newUser, dataLoader)
      analytics.newOrg(userId, orgId, teamId, true)
    }
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
