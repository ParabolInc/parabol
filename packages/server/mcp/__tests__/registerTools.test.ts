import {Client} from '@modelcontextprotocol/sdk/client/index.js'
import {InMemoryTransport} from '@modelcontextprotocol/sdk/inMemory.js'
import {Server} from '@modelcontextprotocol/sdk/server/index.js'
import {ResourceGrants} from '../../graphql/public/ResourceGrants'
import {Logger} from '../../utils/Logger'
import type {MCPContext} from '../MCPContext'
import registerTools from '../registerTools'

const resourceGrants: ResourceGrants = Object.create(ResourceGrants.prototype)

const context: MCPContext = {
  authorization: 'Bearer pat_test',
  ip: '127.0.0.1',
  grant: {userId: 'user-1', scopes: [], aud: 'action-pat', resourceGrants}
}

const connect = async (call: () => Promise<never>) => {
  const server = new Server({name: 'test', version: '1'}, {capabilities: {tools: {}}})
  registerTools(server, context, [
    {definition: {name: 'broken', inputSchema: {type: 'object'}}, call}
  ])
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
  const client = new Client({name: 'test', version: '1'})
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)])
  return client
}

test('a tool that throws is logged and answers INTERNAL_SERVER_ERROR', async () => {
  const logError = jest.spyOn(Logger, 'error').mockImplementation(() => {})
  const thrown = new Error('the database went away')
  const client = await connect(() => Promise.reject(thrown))
  const result = await client.callTool({name: 'broken', arguments: {}})
  expect(result).toEqual({
    isError: true,
    content: [
      {
        type: 'text',
        text: JSON.stringify([{message: thrown.message, code: 'INTERNAL_SERVER_ERROR'}])
      }
    ]
  })
  expect(logError).toHaveBeenCalledWith(thrown, {tags: {tool: 'broken'}, userId: 'user-1'})
  await client.close()
})
