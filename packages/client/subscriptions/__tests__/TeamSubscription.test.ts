import {Environment, Network, Observable, RecordSource, Store} from 'relay-runtime'
import type Atmosphere from '../../Atmosphere'
import TeamSubscription from '../TeamSubscription'

jest.mock('babel-plugin-relay/macro', () => ({
  __esModule: true,
  default: () => jest.requireActual('../../__generated__/TeamSubscription.graphql').default
}))

const orgId = 'org1'
const teamId = 'team1'

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
        [orgId]: {__id: orgId, __typename: 'Organization', id: orgId, tier: 'team'}
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

  it('selects the field of an UpdatePokerTemplateDimensionScalePayload', () => {
    const dimensionId = 'dimension1'
    const scaleId = 'scale1'
    const atmosphere = createTestAtmosphere({
      teamSubscription: {
        fieldName: 'UpdatePokerTemplateDimensionScalePayload',
        UpdatePokerTemplateDimensionScalePayload: {
          dimension: {
            id: dimensionId,
            selectedScale: {id: scaleId, name: 'Shirt sizes'}
          }
        }
      }
    })
    TeamSubscription(atmosphere, {}, {navigate: jest.fn()})
    expect(errorSpy).not.toHaveBeenCalledWith(
      'Notification Subscription Payload received without field:',
      'UpdatePokerTemplateDimensionScalePayload'
    )
    const source = atmosphere.getStore().getSource()
    expect(source.get(dimensionId)?.selectedScale).toEqual({__ref: scaleId})
  })

  it('adds the scale of an AddPokerTemplateScalePayload without opening it for editing', () => {
    const scaleId = 'scale2'
    const atmosphere = createTestAtmosphere({
      teamSubscription: {
        fieldName: 'AddPokerTemplateScalePayload',
        AddPokerTemplateScalePayload: {
          scale: {
            id: scaleId,
            name: 'Shirt sizes Copy',
            isStarter: false,
            teamId,
            values: [{label: '?', color: '#000000'}]
          }
        }
      }
    })
    atmosphere.commitUpdate((store) => {
      store.create(teamId, 'Team').setValue(teamId, 'id')
    })
    TeamSubscription(atmosphere, {}, {navigate: jest.fn()})
    expect(errorSpy).not.toHaveBeenCalledWith(
      'Notification Subscription Payload received without field:',
      'AddPokerTemplateScalePayload'
    )
    const team = atmosphere.getStore().getSource().get(teamId)
    expect(team?.scales).toEqual({__refs: [scaleId]})
    expect(team?.editingScaleId).toBeUndefined()
  })

  it('updates the description of a prompt from an UpdateTemplatePromptDescriptionSuccess', () => {
    const promptId = 'prompt1'
    const atmosphere = createTestAtmosphere({
      teamSubscription: {
        fieldName: 'UpdateTemplatePromptDescriptionSuccess',
        UpdateTemplatePromptDescriptionSuccess: {
          prompt: {id: promptId, description: 'What could we try next sprint?'}
        }
      }
    })
    atmosphere.commitUpdate((store) => {
      store.create(promptId, 'ReflectPrompt').setValue('What went well?', 'description')
    })
    TeamSubscription(atmosphere, {}, {navigate: jest.fn()})
    expect(errorSpy).not.toHaveBeenCalledWith(
      'Notification Subscription Payload received without field:',
      'UpdateTemplatePromptDescriptionSuccess'
    )
    expect(atmosphere.getStore().getSource().get(promptId)?.description).toBe(
      'What could we try next sprint?'
    )
  })
})
