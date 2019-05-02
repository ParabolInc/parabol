import getRethink from 'server/database/rethinkDriver'
import countTiersForUserId from 'server/graphql/queries/helpers/countTiersForUserId'
import segmentIo from 'server/utils/segmentIo'
import {ISegmentEventTrackOptions, TierEnum} from 'universal/types/graphql'
import resolvePromiseObj from 'universal/utils/resolvePromiseObj'
import {ENTERPRISE, PERSONAL, PRO} from '../../universal/utils/constants'

const PERSONAL_TIER_MAX_TEAMS = 2

interface HubspotTraits {
  solesOpOrgCount: number
  salesOpMeetingCount: number
  isAnyBillingLeader: boolean
  highestTier: TierEnum
}

const getHubspotTraits = (userIds: string[]) => {
  const r = getRethink()
  // # of orgs the user is on where teams is >= 3
  return r(userIds).map((userId) => ({
    salesOpOrgCount: r
      .table('OrganizationUser')
      .getAll(userId, {index: 'userId'})
      .filter({removedAt: null})
      .coerceTo('array')('orgId')
      .default([])
      .do((orgIds) => {
        return r
          .table('Organization')
          .getAll(r.args(orgIds), {index: 'id'})
          .merge((row) => ({
            teamCount: r
              .table('Team')
              .getAll(row('id'), {index: 'orgId'})
              .count()
          }))
          .filter((row) => row('teamCount').gt(PERSONAL_TIER_MAX_TEAMS))
          .count()
      }),
    salesOpMeetingCount: r
      .table('MeetingMember')
      .getAll(userId, {index: 'userId'})
      .count(),
    isAnyBillingLeader: r
      .table('OrganizationUser')
      .getAll(userId, {index: 'userId'})
      .filter({removedAt: null, role: 'billingLeader'})
      .count()
      .ge(1),
    highestTier: r
      .table('OrganizationUser')
      .getAll(userId, {index: 'userId'})
      .filter({removedAt: null})
      .coerceTo('array')('orgId')
      .default([])
      .do((orgIds) => {
        return r
          .table('Organization')
          .getAll(r.args(orgIds), {index: 'id'})
          .coerceTo('array')('tier')
          .distinct()
      })
      .do((tiers) => {
        return r.branch(
          tiers.contains(ENTERPRISE),
          ENTERPRISE,
          r.branch(tiers.contains(PRO), PRO, PERSONAL)
        )
      })
  })) as Promise<HubspotTraits[]>
}

interface Traits {
  avatar: string
  createdAt: Date
  email: string
  id: string
  name: string
  parabolId: string
}

const getTraits = (userIds: string[]) => {
  const r = getRethink()
  return r
    .table('User')
    .getAll(r.args(userIds), {index: 'id'})
    .map({
      avatar: r.row('picture').default(''),
      createdAt: r.row('createdAt').default(0),
      email: r.row('email').default(''),
      id: r.row('id').default(''),
      name: r.row('preferredName').default(''),
      parabolId: r.row('id').default('') // passed as a distinct trait name for HubSpot
    }) as Promise<Traits[]>
}

const getOrgId = (teamId) => {
  const r = getRethink()
  return teamId ? r.table('Team').get(teamId)('orgId') : undefined
}

const getSegmentProps = (userIds, teamId) => {
  return resolvePromiseObj({
    traitsArr: getTraits(userIds),
    orgId: getOrgId(teamId)
  })
}

export const sendSegmentIdentify = async (maybeUserIds) => {
  const userIds = Array.isArray(maybeUserIds) ? maybeUserIds : [maybeUserIds]
  const [traitsArr, hubspotTraitsArr] = await Promise.all([
    getTraits(userIds),
    getHubspotTraits(userIds)
  ])
  traitsArr.forEach(async (traitsWithId, idx) => {
    const {id: userId, ...traits} = traitsWithId
    const tiersCountTraits = await countTiersForUserId(userId)
    segmentIo.identify({
      userId,
      traits: {
        ...traits,
        ...hubspotTraitsArr[idx],
        ...tiersCountTraits
      }
    })
  })
}

interface Options extends ISegmentEventTrackOptions {
  [key: string]: any
}

const sendSegmentEvent = async (
  event: string,
  maybeUserIds: string | string[],
  options: Options = {}
) => {
  const userIds = Array.isArray(maybeUserIds) ? maybeUserIds : [maybeUserIds]
  const {traitsArr, orgId} = await getSegmentProps(userIds, options.teamId)
  traitsArr.forEach((traitsWithId) => {
    const {id: userId, ...traits} = traitsWithId
    segmentIo.track({
      userId,
      event,
      properties: {
        orgId,
        traits,
        // options is a superset of SegmentEventTrackOptions
        ...options
      }
    })
  })
}

export default sendSegmentEvent
