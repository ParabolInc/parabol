import {Environment, Network, RecordSource, Store} from 'relay-runtime'
import type Atmosphere from '../../Atmosphere'
import AddPokerTemplateScaleMutation from '../AddPokerTemplateScaleMutation'

jest.mock('babel-plugin-relay/macro', () => ({
  __esModule: true,
  default: () =>
    jest.requireActual('../../__generated__/AddPokerTemplateScaleMutation.graphql').default
}))

const teamId = 'team1'
const newScaleId = 'scale2'

const createTestAtmosphere = () =>
  new Environment({
    network: Network.create(async () => ({
      data: {
        addPokerTemplateScale: {
          scale: {
            __typename: 'TemplateScale',
            id: newScaleId,
            name: '*New Scale #1',
            isStarter: false,
            teamId,
            values: [{label: '?', color: '#000000'}]
          }
        }
      }
    })),
    store: new Store(
      new RecordSource({
        [teamId]: {
          __id: teamId,
          __typename: 'Team',
          id: teamId,
          scales: {__refs: []},
          editingScaleId: null
        }
      })
    )
  }) as unknown as Atmosphere

describe('AddPokerTemplateScaleMutation', () => {
  it('opens the new scale for editing for the person who added it', async () => {
    const atmosphere = createTestAtmosphere()
    await new Promise<void>((resolve, reject) => {
      AddPokerTemplateScaleMutation(
        atmosphere,
        {teamId},
        {onCompleted: () => resolve(), onError: reject}
      )
    })
    const team = atmosphere.getStore().getSource().get(teamId)
    expect(team?.scales).toEqual({__refs: [newScaleId]})
    expect(team?.editingScaleId).toBe(newScaleId)
  })
})
