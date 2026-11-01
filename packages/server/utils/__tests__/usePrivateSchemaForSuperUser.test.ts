jest.mock('../../graphql/public/rootSchema', () => ({
  __esModule: true,
  default: jest.requireActual('graphql-yoga').createSchema({
    typeDefs: 'type Query { version: String }',
    resolvers: {Query: {version: () => '15'}}
  })
}))
jest.mock('../../graphql/private/rootSchema', () => ({
  __esModule: true,
  default: jest.requireActual('graphql-yoga').createSchema({
    typeDefs: 'type Query { version: String, suUserCount: Int }',
    resolvers: {Query: {version: () => '15', suUserCount: () => 42}}
  })
}))

import {createYoga} from 'graphql-yoga'
import publicSchema from '../../graphql/public/rootSchema'
import {usePrivateSchemaForSuperUser} from '../usePrivateSchemaForSuperUser'

const yoga = createYoga({
  schema: publicSchema,
  plugins: [usePrivateSchemaForSuperUser]
})

const countUsers = async (rol?: 'su') => {
  const response = await yoga.fetch(
    'http://localhost/graphql',
    {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({query: '{ suUserCount }'})
    },
    {authToken: {sub: 'user1', rol}}
  )
  return response.json()
}

test('a request after a superuser request runs on the public schema', async () => {
  expect(await countUsers('su')).toEqual({data: {suUserCount: 42}})
  const result = await countUsers()
  expect(result.data).toBeUndefined()
  expect(result.errors[0].message).toBe('Cannot query field "suUserCount" on type "Query".')
  expect(await countUsers('su')).toEqual({data: {suUserCount: 42}})
})
