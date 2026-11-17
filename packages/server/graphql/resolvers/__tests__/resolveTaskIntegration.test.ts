import {fetch} from '@whatwg-node/fetch'
import {readFileSync} from 'fs'
import {
  buildSchema,
  execute,
  type GraphQLFieldResolver,
  type GraphQLObjectType,
  parse,
  validate
} from 'graphql'
import path from 'path'
import type {Task} from '../../../postgres/types'
import type {InternalContext} from '../../graphql'
import nestLinearEndpoint from '../../nestedSchema/nestLinearEndpoint'
import {linearRequest} from '../../public/rootSchema'
import {resolveTaskIntegration} from '../resolveTaskIntegration'

jest.mock('@whatwg-node/fetch', () => ({fetch: jest.fn()}))
jest.mock('../../public/rootSchema', () => ({
  __esModule: true,
  default: {},
  githubRequest: jest.fn(),
  gitlabRequest: jest.fn(),
  linearRequest: jest.fn()
}))

const readSDL = (relativePath: string) => readFileSync(path.join(__dirname, relativePath), 'utf8')
const linearSchemaIDL = readSDL('../../nestedSchema/Linear/linearSchema.graphql')
const linearSchema = buildSchema(linearSchemaIDL, {assumeValidSDL: true})
const linear = nestLinearEndpoint({
  parentType: 'LinearIntegration',
  fieldName: 'api',
  resolveEndpointContext: () => ({accessToken: 'lin_token'}),
  prefix: '_xLinear',
  schemaIDL: linearSchemaIDL
})
jest.mocked(linearRequest).mockImplementation(linear.request)

const schema = buildSchema(readSDL('../../public/schema.graphql'), {assumeValidSDL: true})
const getFields = (typeName: string) => (schema.getType(typeName) as GraphQLObjectType).getFields()
getFields('_xLinearApi').query!.resolve = linear.resolvers._xLinearApi!.query
getFields('Task').integration!.resolve = (task, _args, context, info) =>
  resolveTaskIntegration(task, context, info)
const resolveByAlias: GraphQLFieldResolver<Record<string, unknown>, unknown> = (
  source,
  _args,
  _context,
  info
) => source[info.fieldNodes[0]!.alias?.value ?? info.fieldName]

const task = {
  id: 'task1',
  teamId: 'team1',
  integration: {
    service: 'linear',
    accessUserId: 'user1',
    issueId: 'issue1',
    repoId: 'linearTeam1'
  }
} as unknown as Task
const context = {
  authToken: {sub: 'user1'},
  dataLoader: {get: () => ({load: async () => ({accessToken: 'lin_token'})})}
} as unknown as InternalContext

const linearIssue = {
  id: 'issue1',
  title: 'Fix the login page',
  identifier: 'ENG-7',
  url: 'https://linear.app/acme/issue/ENG-7',
  project: null,
  team: {id: 'linearTeam1', name: 'Engineering'},
  state: {id: 'state1', name: 'Todo'}
}
const sentQueries: string[] = []
jest.mocked(fetch).mockImplementation(async (_url, init) => {
  const {query, variables} = JSON.parse(String(init?.body))
  sentQueries.push(query)
  const result = await execute({
    schema: linearSchema,
    document: parse(query),
    rootValue: {issue: linearIssue},
    variableValues: variables
  })
  return new Response(JSON.stringify(result))
})

beforeEach(() => {
  sentQueries.length = 0
})

const readTaskIntegration = (query: string, variableValues?: Record<string, unknown>) =>
  execute({
    schema,
    document: parse(query),
    rootValue: {createTaskIntegration: {task}},
    contextValue: context,
    variableValues,
    fieldResolver: resolveByAlias
  })

const linkFragments = `
  fragment TaskLink_integration on TaskIntegration {
    __isTaskIntegration: __typename
    id
    ...jiraLink_issue
    ...linearLink_issue
  }
  fragment jiraLink_issue on JiraIssue {
    issueKey
  }
  fragment linearLink_issue on _xLinearIssue {
    identifier
    team {
      ...linearTeam_team
    }
    linearState: state {
      name
    }
    url
  }
  fragment linearTeam_team on _xLinearTeam {
    name
  }
`

test('a task linked to Linear reads the fields of fragments spread inside another fragment, as Relay prints them', async () => {
  const result = await readTaskIntegration(`
    mutation {
      createTaskIntegration(integrationProviderService: linear, integrationRepoId: "r", taskId: "t") {
        task {
          integration {
            __typename
            ...TaskLink_integration
            id
          }
        }
      }
    }
    ${linkFragments}
  `)
  expect(result.errors).toBeUndefined()
  expect(result.data).toEqual({
    createTaskIntegration: {
      task: {
        integration: {
          __typename: '_xLinearIssue',
          id: 'issue1',
          __isTaskIntegration: '_xLinearIssue',
          identifier: 'ENG-7',
          team: {name: 'Engineering'},
          linearState: {name: 'Todo'},
          url: 'https://linear.app/acme/issue/ENG-7'
        }
      }
    }
  })
  expect(sentQueries).toHaveLength(1)
  expect(validate(linearSchema, parse(sentQueries[0]!))).toEqual([])
})

test('a directive on a fragment spread still reaches Linear', async () => {
  const result = await readTaskIntegration(
    `
    mutation ($withLink: Boolean!) {
      createTaskIntegration(integrationProviderService: linear, integrationRepoId: "r", taskId: "t") {
        task {
          integration {
            __typename
            id
            ...TaskLink_integration @include(if: $withLink)
          }
        }
      }
    }
    ${linkFragments}
  `,
    {withLink: false}
  )
  expect(result.errors).toBeUndefined()
  expect(result.data).toEqual({
    createTaskIntegration: {task: {integration: {__typename: '_xLinearIssue', id: 'issue1'}}}
  })
  expect(sentQueries).toHaveLength(1)
  expect(sentQueries[0]).toContain('@include(if: $withLink)')
  expect(validate(linearSchema, parse(sentQueries[0]!))).toEqual([])
})

test('a payload that selects the Linear issue inline and through a fragment resolves its type', async () => {
  const result = await readTaskIntegration(`
    mutation {
      createTaskIntegration(integrationProviderService: linear, integrationRepoId: "r", taskId: "t") {
        task {
          integration {
            __typename
            ... on _xLinearIssue {
              __typename
              id
              title
              team {
                name
              }
            }
            ...TaskLink_integration
            id
          }
        }
      }
    }
    ${linkFragments}
  `)
  expect(result.errors).toBeUndefined()
  expect(result.data).toEqual({
    createTaskIntegration: {
      task: {
        integration: {
          __typename: '_xLinearIssue',
          id: 'issue1',
          title: 'Fix the login page',
          team: {name: 'Engineering'},
          __isTaskIntegration: '_xLinearIssue',
          identifier: 'ENG-7',
          linearState: {name: 'Todo'},
          url: 'https://linear.app/acme/issue/ENG-7'
        }
      }
    }
  })
  expect(sentQueries).toHaveLength(1)
  expect(validate(linearSchema, parse(sentQueries[0]!))).toEqual([])
})
