import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {getUserId, isSuperUser, isUserBillingLeader} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import standardError from '../../../utils/standardError'
import resolveDowngradeToStarter from '../../mutations/helpers/resolveDowngradeToStarter'
import type {MutationResolvers} from '../resolverTypes'

const downgradeToStarter: MutationResolvers['downgradeToStarter'] = async (
  _source,
  {orgId, reasonsForLeaving, otherTool},
  {authToken, dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // AUTH
  const viewerId = getUserId(authToken)
  const [isBillingLeader, viewer] = await Promise.all([
    isUserBillingLeader(viewerId, orgId, dataLoader),
    dataLoader.get('users').loadNonNull(viewerId)
  ])
  if (!isSuperUser(authToken) && !isBillingLeader) {
    return standardError(new Error('Not organization leader'), {userId: viewerId})
  }

  // VALIDATION
  if (otherTool && otherTool?.length > 100) {
    return standardError(new Error('Other tool name is too long'), {userId: viewerId})
  }

  const {stripeSubscriptionId, tier} = await dataLoader.get('organizations').loadNonNull(orgId)
  dataLoader.get('organizations').clear(orgId)

  if (tier === 'starter') {
    return standardError(new Error('Already on free tier'), {userId: viewerId})
  }

  // RESOLUTION
  await resolveDowngradeToStarter(
    orgId,
    stripeSubscriptionId!,
    viewer,
    dataLoader,
    reasonsForLeaving ?? undefined,
    otherTool ?? undefined
  )
  const teams = await dataLoader.get('teamsByOrgIds').load(orgId)
  const teamIds = teams.map(({id}) => id)
  const data = {orgId, teamIds}
  publish(SubscriptionChannel.ORGANIZATION, orgId, 'DowngradeToStarterPayload', data, subOptions)

  teamIds.forEach((teamId) => {
    const teamData = {orgId, teamIds: [teamId]}
    publish(SubscriptionChannel.TEAM, teamId, 'DowngradeToStarterPayload', teamData, subOptions)
  })
  return data
}

export default downgradeToStarter
