import {readFileSync} from 'node:fs'
import path from 'node:path'
import {addResolversToSchema} from '@graphql-tools/schema'
import {buildSchema, execute, parse} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import AuthToken from '../../../../database/types/AuthToken'
import publish from '../../../../utils/publish'
import composeResolvers from '../../../composeResolvers'
import permissions from '../../permissions'
import updateDragLocation from '../updateDragLocation'

// A drag update must stay a broadcast, so a Postgres query or any use of the dataloader fails the test
jest.mock('../../../../postgres/getKysely', () => ({
  __esModule: true,
  default: () => {
    throw new Error('a drag update queried Postgres')
  }
}))
jest.mock('../../../../utils/publish', () => ({__esModule: true, default: jest.fn()}))

const dataLoader = new Proxy(
  {},
  {
    get: (_target, key) => {
      throw new Error(`a drag update used the dataloader: ${String(key)}`)
    }
  }
)

// rootSchema loads its resolvers with webpack's require.context, so compose the parts this test needs onto the built SDL
const typeDefs = buildSchema(readFileSync(path.join(__dirname, '../../schema.graphql'), 'utf8'))
const schema = addResolversToSchema({
  schema: typeDefs,
  resolvers: composeResolvers({Mutation: {updateDragLocation}}, permissions, typeDefs),
  inheritResolversFromInterfaces: true
})

const UPDATE_DRAG_LOCATION = parse(`
  mutation UpdateDragLocation($input: UpdateDragLocationInput!) {
    updateDragLocation(input: $input)
  }
`)

const input = {
  id: 'drag1',
  clientHeight: 800,
  clientWidth: 1200,
  meetingId: 'meeting1',
  sourceId: 'reflection1',
  teamId: 'team1'
}

const sendDrag = (tms: string[]) =>
  execute({
    schema,
    document: UPDATE_DRAG_LOCATION,
    variableValues: {input},
    // what wsHandler.onSubscribe passes for a mutation
    contextValue: {authToken: new AuthToken({sub: 'user1', tms}), dataLoader, socketId: 'socket1'}
  })

test('a drag update is broadcast without Postgres, the dataloader or a shared operationId', async () => {
  const result = await sendDrag(['team1'])

  expect(result).toEqual({data: {updateDragLocation: true}})
  const {teamId: _teamId, meetingId: _meetingId, ...remoteDrag} = input
  expect(publish).toHaveBeenCalledTimes(1)
  expect(jest.mocked(publish).mock.calls[0]).toStrictEqual([
    SubscriptionChannel.MEETING,
    'meeting1',
    'UpdateDragLocationPayload',
    {remoteDrag, userId: 'user1'},
    {mutatorId: 'socket1'}
  ])
})

test('a drag update for a team the viewer is not on is rejected', async () => {
  const result = await sendDrag(['team2'])

  expect(result.errors?.map(({message}) => message)).toEqual(['Viewer is not on team'])
  expect(publish).not.toHaveBeenCalled()
})
