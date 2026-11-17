import {addResolversToSchema} from '@graphql-tools/schema'
import {
  buildSchema,
  type DocumentNode,
  execute,
  type GraphQLResolveInfo,
  parse,
  print
} from 'graphql'
import {
  type EndpointExecutionResult,
  nestGraphQLEndpoint,
  nestGraphQLEndpoints
} from 'nest-graphql-endpoint'
import inlineNestedFragments from '../inlineNestedFragments'

const executor = jest.fn(
  async (_document: DocumentNode): Promise<EndpointExecutionResult> => ({data: null})
)

const endpoint = inlineNestedFragments(
  nestGraphQLEndpoint({
    parentType: 'Query',
    fieldName: 'api',
    prefix: '_xTracker',
    resolveEndpointContext: () => ({accessToken: 'tracker-token'}),
    schemaIDL: `
      type Query { issue(id: ID!): Issue }
      type Mutation { closeIssue(id: ID!): CloseIssuePayload }
      type CloseIssuePayload { issue: Issue }
      type Issue { id: ID! title: String url: String state: IssueState }
      type IssueState { name: String }
    `,
    executor
  })
)

const nestedSchema = nestGraphQLEndpoints(
  buildSchema(`
    interface Integration { id: ID! }
    type JiraIssue implements Integration { id: ID! issueKey: String }
    type _xTrackerIssue implements Integration { id: ID! }
    type Task { integration: Integration }
    type Query { task: Task }
  `),
  [endpoint]
)
const schema = addResolversToSchema({
  schema: nestedSchema,
  resolvers: {
    ...endpoint.resolvers,
    Query: {...endpoint.resolvers.Query, task: () => ({})},
    Integration: {__resolveType: ({__typename}: {__typename: string}) => __typename},
    Task: {
      integration: async (_source, _args, context, info: GraphQLResolveInfo) => {
        const {data} = await endpoint.request({
          query: 'query { issue(id: "issue1") { ...info } }',
          endpointContext: {accessToken: 'tracker-token'},
          info,
          batchRef: context
        })
        return data
      }
    }
  }
})

const issue = {
  __typename: 'Issue',
  id: 'issue1',
  title: 'Ship the widget',
  state: {__typename: 'IssueState', name: 'Open'}
}

const sentDocuments = () => executor.mock.calls.map(([document]) => print(document))

beforeEach(() => {
  executor.mockReset()
})

test('a nested request keeps the fields of a fragment spread inside another fragment', async () => {
  executor.mockResolvedValue({data: {issue}})
  const result = await execute({
    schema,
    contextValue: {},
    document: parse(`
      query {
        task {
          integration {
            __typename
            ...IntegrationLink
          }
        }
      }
      fragment IntegrationLink on Integration {
        id
        ...JiraLink
        ...TrackerLink
      }
      fragment JiraLink on JiraIssue {
        issueKey
      }
      fragment TrackerLink on _xTrackerIssue {
        title
        state {
          name
        }
      }
    `)
  })
  expect(result).toEqual({
    data: {
      task: {
        integration: {
          __typename: '_xTrackerIssue',
          id: 'issue1',
          title: 'Ship the widget',
          state: {name: 'Open'}
        }
      }
    }
  })
  expect(sentDocuments()).toEqual([
    print(
      parse(`
        {
          issue(id: "issue1") {
            __typename
            ... on Issue {
              id
              ... on Issue {
                title
                state {
                  name
                }
              }
            }
          }
        }
      `)
    )
  ])
})

const inlinedIssueFields =
  '... on Issue { id ... on Issue { title state { name } } ... on Issue @skip(if: true) { url } }'

test.each([
  [
    'query',
    'query { api { query { issue(id: "issue1") { ...IssueFields } } } }',
    {issue},
    {api: {query: {issue: {id: 'issue1', title: 'Ship the widget', state: {name: 'Open'}}}}},
    `{ issue(id: "issue1") { ${inlinedIssueFields} } }`
  ],
  [
    'mutation',
    'query { api { mutation { closeIssue(id: "issue1") { issue { ...IssueFields } } } } }',
    {closeIssue: {__typename: 'CloseIssuePayload', issue}},
    {
      api: {
        mutation: {
          closeIssue: {issue: {id: 'issue1', title: 'Ship the widget', state: {name: 'Open'}}}
        }
      }
    },
    `mutation { closeIssue(id: "issue1") { issue { ${inlinedIssueFields} } } }`
  ]
])(
  'a nested %s keeps the fields of a fragment spread inside another fragment',
  async (_operation, operationText, endpointData, expectedData, expectedDocument) => {
    executor.mockResolvedValue({data: endpointData})
    const result = await execute({
      schema,
      contextValue: {},
      document: parse(`
        ${operationText}
        fragment IssueFields on _xTrackerIssue {
          id
          ...IssueTitle
          ...IssueUrl @skip(if: true)
        }
        fragment IssueUrl on _xTrackerIssue {
          url
        }
        fragment IssueTitle on _xTrackerIssue {
          title
          state {
            name
          }
        }
      `)
    })
    expect(result).toEqual({data: expectedData})
    expect(sentDocuments()).toEqual([print(parse(expectedDocument))])
  }
)
