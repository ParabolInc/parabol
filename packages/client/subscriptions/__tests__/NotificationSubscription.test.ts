import {
  createOperationDescriptor,
  Environment,
  Network,
  Observable,
  RecordSource,
  Store
} from 'relay-runtime'
import OrganizationsQuery from '../../__generated__/OrganizationsQuery.graphql'
import type Atmosphere from '../../Atmosphere'
import NotificationSubscription from '../NotificationSubscription'

jest.mock('babel-plugin-relay/macro', () => ({
  __esModule: true,
  default: () => jest.requireActual('../../__generated__/NotificationSubscription.graphql').default
}))
jest.mock('../../mutations/toasts/popNotificationToast', () => ({
  popNotificationToastOnNext: jest.fn()
}))
jest.mock('../../mutations/toasts/updateNotificationToast', () => ({
  updateNotificationToastOnNext: jest.fn()
}))

const viewerId = 'user1'
const ownOrg = {
  id: 'org1',
  isBillingLeader: true,
  name: 'Alpha Org',
  orgUserCount: {activeUserCount: 1, inactiveUserCount: 0},
  picture: null,
  tier: 'starter',
  billingTier: 'starter'
}
const joinedOrg = {
  id: 'org2',
  isBillingLeader: false,
  name: 'Beta Org',
  orgUserCount: {activeUserCount: 4, inactiveUserCount: 1},
  picture: null,
  tier: 'team',
  billingTier: 'team',
  isPaid: true
}

const createTestAtmosphere = (data: Record<string, unknown>) => {
  const environment = new Environment({
    network: Network.create(
      () => Observable.create(() => {}),
      () =>
        Observable.create((sink) => {
          sink.next({data})
          sink.complete()
        })
    ),
    store: new Store(new RecordSource())
  })
  return Object.assign(environment, {
    registerSubscription: () => 'notificationSubscription',
    unregisterSub: () => {}
  }) as unknown as Atmosphere
}

describe('NotificationSubscription', () => {
  let errorSpy: jest.SpyInstance
  let warnSpy: jest.SpyInstance
  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
  })
  afterEach(() => {
    errorSpy.mockRestore()
    warnSpy.mockRestore()
  })

  it('adds an organization joined by accepting an invitation with what the organizations list reads', () => {
    const atmosphere = createTestAtmosphere({
      notificationSubscription: {
        fieldName: 'AcceptTeamInvitationPayload',
        AcceptTeamInvitationPayload: {
          error: null,
          meetingId: null,
          meeting: null,
          teamLead: null,
          team: {
            id: 'team2',
            name: 'Beta Team',
            activeMeetings: [],
            organization: joinedOrg
          }
        }
      }
    })
    const organizationsQuery = createOperationDescriptor(OrganizationsQuery, {})
    atmosphere.commitPayload(organizationsQuery, {
      viewer: {id: viewerId, organizations: [ownOrg]}
    })
    atmosphere.retain(organizationsQuery)

    NotificationSubscription(atmosphere, {}, {navigate: jest.fn()})

    const snapshot = atmosphere.lookup(organizationsQuery.fragment)
    const {organizations} = (snapshot.data as {viewer: {organizations: {id: string}[]}}).viewer
    expect(organizations.map(({id}) => id)).toEqual([ownOrg.id, joinedOrg.id])
    expect(snapshot.isMissingData).toBe(false)
  })
})
