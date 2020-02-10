import getRethink from '../database/rethinkDriver'
import countTiersForUserId from '../graphql/queries/helpers/countTiersForUserId'
import segmentIo from './segmentIo'
import {ISegmentEventTrackOptions, TierEnum, OrgUserRole} from '../../client/types/graphql'

const PERSONAL_TIER_MAX_TEAMS = 2

interface HubspotTraits {
  id: string
  solesOpOrgCount: number
  salesOpMeetingCount: number
  isAnyBillingLeader: boolean
  highestTier: TierEnum
}

const getHubspotTraits = async (userIds: string[]) => {
  const r = await getRethink()
  // # of orgs the user is on where teams is >= 3
  return r(userIds)
    .map((userId) => ({
      id: userId,
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
        .filter({removedAt: null, role: OrgUserRole.BILLING_LEADER})
        .count()
        .ge(1),
      highestTier: r
        .table('User')
        .get(userId)('tier')
        .default(TierEnum.personal)
    }))
    .run() as Promise<HubspotTraits[]>
}

interface Traits {
  avatar: string
  createdAt: Date
  email: string
  id: string
  parabolId: string
  parabolPreferredName: string
}

const getTraits = async (userIds: string[]) => {
  const r = await getRethink()
  if (userIds.length === 0) return []
  return r
    .table('User')
    .getAll(r.args(userIds), {index: 'id'})
    .map((row) => ({
      avatar: row('picture').default(''),
      createdAt: row('createdAt').default(0),
      email: row('email').default(''),
      id: row('id').default(''),
      parabolId: row('id').default(''), // passed as a distinct trait name for HubSpot
      parabolPreferredName: row('preferredName').default('')
    }))
    .run() as Promise<Traits[]>
}

const getOrgId = async (teamId: string | undefined | null) => {
  const r = await getRethink()
  return teamId
    ? r
        .table('Team')
        .get(teamId)('orgId')
        .run()
    : undefined
}

const getSegmentProps = (userIds: string[], teamId: string | null | undefined) => {
  return Promise.all([getTraits(userIds), getOrgId(teamId)])
}

export const sendSegmentIdentify = async (maybeUserIds) => {
  const userIds = Array.isArray(maybeUserIds) ? maybeUserIds : [maybeUserIds]
  const [traitsArr, hubspotTraitsArr] = await Promise.all([
    getTraits(userIds),
    getHubspotTraits(userIds)
  ])
  traitsArr.forEach(async (traitsWithId) => {
    const {id: userId, ...traits} = {
      ...traitsWithId,
      ...hubspotTraitsArr.find((hubspotTraitsWithId) => traitsWithId.id === hubspotTraitsWithId.id)
    }
    const tiersCountTraits = await countTiersForUserId(userId)
    segmentIo.identify({
      userId,
      traits: {
        ...traits,
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
  if (userIds.length === 0) return
  const [traitsArr, orgId] = await getSegmentProps(userIds, options.teamId)
    // typescript 3.7 is borked
  ;(traitsArr as Traits[]).forEach((traitsWithId) => {
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
