import AuthToken from '../../../database/types/AuthToken'
import TimelineEventJoinedParabol from '../../../database/types/TimelineEventJoinedParabol'
import User from '../../../database/types/User'
import generateUID from '../../../generateUID'
import getKysely from '../../../postgres/getKysely'
import getUsersbyDomain from '../../../postgres/queries/getUsersByDomain'
import IUser from '../../../postgres/types/IUser'
import acceptTeamInvitation from '../../../safeMutations/acceptTeamInvitation'
import {analytics} from '../../../utils/analytics/analytics'
import getSAMLURLFromEmail from '../../../utils/getSAMLURLFromEmail'
import sendPromptToJoinOrg from '../../../utils/sendPromptToJoinOrg'
import {DataLoaderWorker} from '../../graphql'
import isValid from '../../isValid'
import addSeedTasks from './addSeedTasks'
import createNewOrg from './createNewOrg'
import createTeamAndLeader from './createTeamAndLeader'

const bootstrapNewUser = async (
  newUser: User,
  isOrganic: boolean,
  dataLoader: DataLoaderWorker
) => {
  const {id: userId, createdAt, preferredName, email, tier, pseudoId, identities} = newUser
  // email is checked by the caller
  const domain = email.split('@')[1]!
  const [isCompanyDomain, organizations] = await Promise.all([
    dataLoader.get('isCompanyDomain').load(domain),
    dataLoader.get('organizationsByActiveDomain').load(domain)
  ])
  const usersWithDomain = isCompanyDomain ? await getUsersbyDomain(domain) : []
  const isPatient0 = !!domain && isCompanyDomain && usersWithDomain.length === 0

  const joinEvent = new TimelineEventJoinedParabol({userId})

  const isVerified = identities.some((identity) => identity.isEmailVerified)
  const hasSAMLURL = !!(await getSAMLURLFromEmail(email, dataLoader, false))
  const isQualifiedForAutoJoin = (isVerified || hasSAMLURL) && isCompanyDomain
  const orgIds = organizations.map(({id}) => id)
  const pg = getKysely()
  const [teamsWithAutoJoinRes] = await Promise.all([
    isQualifiedForAutoJoin ? dataLoader.get('autoJoinTeamsByOrgId').loadMany(orgIds) : [],
    pg
      .with('User', (qc) =>
        qc.insertInto('User').values({
          ...newUser,
          isPatient0,
          identities: newUser.identities.map((identity) => JSON.stringify(identity))
        })
      )
      .insertInto('TimelineEvent')
      .values(joinEvent)
      .execute()
  ])

  // Identify the user so user properties are set before any events are sent
  analytics.identify({
    userId,
    createdAt,
    email,
    name: preferredName,
    isActive: true,
    highestTier: tier,
    isPatient0,
    anonymousId: pseudoId
  })

  const teamsWithAutoJoin = teamsWithAutoJoinRes.flat().filter(isValid)
  const tms = [] as string[]
  if (!isOrganic) {
    const nonOrganicActions = [
      {
        id: generateUID(),
        userId,
        type: 'tryTheDemo' as const,
        priority: 1
      },
      {
        id: generateUID(),
        userId,
        type: 'createNewTeam' as const,
        priority: 4
      }
    ]
    await pg
      .insertInto('SuggestedAction')
      .values(nonOrganicActions)
      .onConflict((oc) => oc.columns(['userId', 'type']).doNothing())
      .execute()
  }
  if (teamsWithAutoJoin.length > 0) {
    await Promise.all(
      teamsWithAutoJoin.map((team) => {
        const teamId = team.id
        tms.push(teamId)
        const inviteYourTeam = {
          id: generateUID(),
          userId,
          teamId,
          type: 'inviteYourTeam' as const,
          priority: 2
        }
        // We're racing with accept team invitation here which also adds some suggested actions. We don't want this to fail just because of duplicates.
        return Promise.all([
          acceptTeamInvitation(team, userId, dataLoader),
          isOrganic &&
            pg
              .insertInto('SuggestedAction')
              .values(inviteYourTeam)
              .onConflict((oc) => oc.columns(['userId', 'type']).doNothing())
              .execute(),
          analytics.autoJoined(newUser, teamId)
        ])
      })
    )
  } else if (isOrganic) {
    const orgId = generateUID()
    const teamId = generateUID()
    tms.push(teamId) // MUTATIVE
    const validNewTeam = {
      id: teamId,
      orgId,
      name: `${preferredName}’s Team`,
      isOnboardTeam: true,
      isPublic: true
    }
    const orgName = `${newUser.preferredName}’s Org`
    await createNewOrg(orgId, orgName, userId, email, dataLoader)
    await createTeamAndLeader(newUser as IUser, validNewTeam, dataLoader)
    await Promise.all([addSeedTasks(userId, teamId), sendPromptToJoinOrg(newUser, dataLoader)])
    analytics.newOrg(newUser, orgId, teamId, true)
  }

  analytics.accountCreated(newUser, !isOrganic, isPatient0)

  return new AuthToken({sub: userId, tms})
}

export default bootstrapNewUser
