import {Window} from 'happy-dom'
import {
  commitMutation,
  Environment,
  type GraphQLResponse,
  Network,
  RecordSource,
  Store
} from 'relay-runtime'
import SetMeetingMusicMutationRequest, {
  type SetMeetingMusicMutation as SetMeetingMusicMutationType
} from '../../../__generated__/SetMeetingMusicMutation.graphql'
import type Atmosphere from '../../../Atmosphere'
import {setMeetingMusicMeetingUpdater} from '../../../mutations/SetMeetingMusicMutation'
import {RetroDemo} from '../../../types/constEnums'
import type LocalAtmosphere from '../LocalAtmosphere'

jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))
jest.mock('../getDemoTitles', () => ({__esModule: true, default: async () => null}))
jest.mock('../../../utils/getDemoAvatar', () => ({
  __esModule: true,
  default: () => ({preferredName: 'Teammate', email: 'teammate@example.test', picture: ''})
}))

const trackSrc = '/static/sounds/some-track.mp3'

const happyWindow = new Window({url: 'https://parabol.test/'})

const createDemoEnvironment = async () => {
  Object.assign(globalThis, {window: happyWindow, document: happyWindow.document})
  const {default: ClientGraphQLServer} = await import('../ClientGraphQLServer')
  const server = new ClientGraphQLServer({} as LocalAtmosphere)
  const source = new RecordSource()
  source.set(RetroDemo.MEETING_ID, {
    __id: RetroDemo.MEETING_ID,
    __typename: 'RetrospectiveMeeting',
    id: RetroDemo.MEETING_ID
  })
  return new Environment({
    network: Network.create(
      async (operation, variables) =>
        (await server.fetch(operation.name, variables)) as unknown as GraphQLResponse
    ),
    store: new Store(source)
  })
}

describe('ClientGraphQLServer', () => {
  let errorSpy: jest.SpyInstance
  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    errorSpy.mockRestore()
  })
  afterAll(async () => {
    await happyWindow.happyDOM.close()
  })

  it('lets the demo facilitator set the meeting music', async () => {
    const environment = await createDemoEnvironment()
    const variables = {meetingId: RetroDemo.MEETING_ID, trackSrc, isPlaying: true}
    await new Promise<void>((resolve, reject) => {
      commitMutation<SetMeetingMusicMutationType>(environment, {
        mutation: SetMeetingMusicMutationRequest,
        variables,
        updater: (store) => {
          const payload = store.getRootField('setMeetingMusic')
          setMeetingMusicMeetingUpdater(payload as never, {atmosphere: {} as Atmosphere, store})
        },
        onCompleted: (_response, errors) => (errors ? reject(errors) : resolve()),
        onError: reject
      })
    })
    expect(errorSpy).not.toHaveBeenCalled()
    const source = environment.getStore().getSource()
    const musicSettings = source.get(RetroDemo.MEETING_ID)?.musicSettings as {__ref: string}
    const musicSettingsRecord = source.get(musicSettings.__ref)
    expect(musicSettingsRecord).toMatchObject({trackSrc, isPlaying: true})
  })
})
