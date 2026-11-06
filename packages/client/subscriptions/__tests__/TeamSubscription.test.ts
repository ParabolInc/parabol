import {Environment, Network, Observable, RecordSource, Store} from 'relay-runtime'
import type Atmosphere from '../../Atmosphere'
import TeamSubscription from '../TeamSubscription'

jest.mock('babel-plugin-relay/macro', () => ({
  __esModule: true,
  default: () => jest.requireActual('../../__generated__/TeamSubscription.graphql').default
}))

const orgId = 'org1'
const teamId = 'team1'
const existingScaleId = 'scale1'
const newScaleId = 'scale2'

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
    store: new Store(
      new RecordSource({
        [orgId]: {__id: orgId, __typename: 'Organization', id: orgId, tier: 'team'},
        [teamId]: {
          __id: teamId,
          __typename: 'Team',
          id: teamId,
          scales: {__refs: [existingScaleId]},
          editingScaleId: null
        },
        [existingScaleId]: {__id: existingScaleId, __typename: 'TemplateScale', id: existingScaleId}
      })
    )
  })
  return Object.assign(environment, {
    registerSubscription: () => 'teamSubscription',
    unregisterSub: () => {}
  }) as unknown as Atmosphere
}

describe('TeamSubscription', () => {
  let errorSpy: jest.SpyInstance
  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    errorSpy.mockRestore()
  })

  it('selects the field of a DowngradeToStarterPayload', () => {
    const atmosphere = createTestAtmosphere({
      teamSubscription: {
        fieldName: 'DowngradeToStarterPayload',
        DowngradeToStarterPayload: {
          organization: {
            id: orgId,
            tier: 'starter',
            billingTier: 'starter',
            isPaid: false,
            teams: [{id: teamId, tier: 'starter'}]
          }
        }
      }
    })
    TeamSubscription(atmosphere, {}, {navigate: jest.fn()})
    expect(errorSpy).not.toHaveBeenCalledWith(
      'Notification Subscription Payload received without field:',
      'DowngradeToStarterPayload'
    )
    expect(atmosphere.getStore().getSource().get(orgId)?.tier).toBe('starter')
  })

  it('adds a new scale from a teammate to the team without opening it for editing', () => {
    const atmosphere = createTestAtmosphere({
      teamSubscription: {
        fieldName: 'AddPokerTemplateScalePayload',
        AddPokerTemplateScalePayload: {
          scale: {
            __typename: 'TemplateScale',
            id: newScaleId,
            name: '*New Scale #2',
            teamId,
            isStarter: false,
            values: [
              {label: '?', color: '#000000'},
              {label: 'Pass', color: '#ffffff'}
            ]
          }
        }
      }
    })
    TeamSubscription(atmosphere, {}, {navigate: jest.fn()})
    expect(errorSpy).not.toHaveBeenCalledWith(
      'Notification Subscription Payload received without field:',
      'AddPokerTemplateScalePayload'
    )
    const team = atmosphere.getStore().getSource().get(teamId)
    expect(team?.scales).toEqual({__refs: [newScaleId, existingScaleId]})
    expect(team?.editingScaleId).toBeNull()
  })
})
