import {Window} from 'happy-dom'
import {
  commitMutation,
  Environment,
  fetchQuery,
  type GraphQLResponse,
  Network,
  RecordSource,
  Store
} from 'relay-runtime'
import SetMeetingMusicMutationRequest, {
  type SetMeetingMusicMutation as SetMeetingMusicMutationType
} from '../../../__generated__/SetMeetingMusicMutation.graphql'
import TaskSendControlQueryRequest, {
  type TaskSendControlQuery as TaskSendControlQueryType
} from '../../../__generated__/TaskSendControlQuery.graphql'
import UngroupReflectionMutationRequest, {
  type UngroupReflectionMutation as UngroupReflectionMutationType
} from '../../../__generated__/UngroupReflectionMutation.graphql'
import type Atmosphere from '../../../Atmosphere'
import {setMeetingMusicMeetingUpdater} from '../../../mutations/SetMeetingMusicMutation'
import {RetroDemo} from '../../../types/constEnums'
import {demoViewerId} from '../initDB'
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
  const environment = new Environment({
    network: Network.create(
      async (operation, variables) =>
        (await server.fetch(operation.name, variables)) as unknown as GraphQLResponse
    ),
    store: new Store(source)
  })
  return {environment, server}
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
    const {environment} = await createDemoEnvironment()
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

  it('tells a demo task card where it can be sent', async () => {
    const {environment} = await createDemoEnvironment()
    const data = await fetchQuery<TaskSendControlQueryType>(
      environment,
      TaskSendControlQueryRequest,
      {teamId: 'demoTeam'}
    ).toPromise()
    expect(errorSpy).not.toHaveBeenCalled()
    expect(data?.viewer.teamMember?.services).toEqual(
      expect.arrayContaining([{service: 'jira', isConnected: true}])
    )
  })

  it('lets the demo viewer take reflections out of a group', async () => {
    const {environment, server} = await createDemoEnvironment()
    const reflectionIds = ['ref1', 'ref2', 'ref3']
    for (const id of reflectionIds) {
      await server.ops.CreateReflectionMutation(
        {
          input: {
            id,
            groupId: `${id}Group`,
            content: JSON.stringify({type: 'doc', content: [{type: 'paragraph'}]}),
            promptId: 'startId',
            sortOrder: 0
          }
        },
        demoViewerId
      )
    }
    for (const reflectionId of ['ref2', 'ref3']) {
      server.ops.EndDraggingReflectionMutation(
        {
          reflectionId,
          dropTargetType: 'REFLECTION_GROUP',
          dropTargetId: 'ref1Group',
          dragId: 'drag'
        },
        demoViewerId
      )
    }
    const groupIdOf = (reflectionId: string) =>
      server.db.reflections.find(({id}) => id === reflectionId)?.reflectionGroupId
    const ungroup = (variables: UngroupReflectionMutationType['variables']) =>
      new Promise<void>((resolve, reject) => {
        commitMutation<UngroupReflectionMutationType>(environment, {
          mutation: UngroupReflectionMutationRequest,
          variables,
          onCompleted: (_response, errors) => (errors ? reject(errors) : resolve()),
          onError: reject
        })
      })

    await ungroup({reflectionId: 'ref2'})
    expect(groupIdOf('ref1')).toBe(groupIdOf('ref3'))
    expect(groupIdOf('ref2')).not.toBe(groupIdOf('ref1'))

    await ungroup({reflectionGroupId: groupIdOf('ref1')})
    expect(new Set(reflectionIds.map(groupIdOf)).size).toBe(3)
    expect(errorSpy).not.toHaveBeenCalled()
    expect(server.db.reflectionGroups.map(({reflections}) => reflections.length)).toEqual([1, 1, 1])
  })
})
