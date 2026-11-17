import fs from 'fs'
import {buildSchema, graphql} from 'graphql'
import http from 'http'
import type {AddressInfo} from 'net'
import path from 'path'
import getKysely from '../postgres/getKysely'
import {sendPublic, signUp} from './common'

const gitlabSchema = buildSchema(
  fs.readFileSync(
    path.join(__dirname, '../graphql/nestedSchema/GitLab/gitlabSchema.graphql'),
    'utf8'
  ),
  {assumeValidSDL: true}
)

const issueByGid = (gid: string) => {
  const iid = gid.split('/').at(-1)!
  return {
    id: gid,
    iid,
    title: `Widget ${iid}`,
    webUrl: `https://gitlab.example.com/acme/widgets/-/issues/${iid}`,
    state: 'opened'
  }
}

let createdIssueCount = 0
const gitlabQueries: string[] = []
const gitlabServer = http.createServer(async (req, res) => {
  let body = ''
  for await (const chunk of req) body += chunk
  const {query, variables} = JSON.parse(body)
  gitlabQueries.push(query)
  const result = await graphql({
    schema: gitlabSchema,
    source: query,
    variableValues: variables,
    rootValue: {
      issue: ({id}: {id: string}) => issueByGid(id),
      createIssue: () => ({
        errors: [],
        issue: issueByGid(`gid://gitlab/Issue/${++createdIssueCount}`)
      })
    }
  })
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(result))
})
let gitlabServerUrl: string

beforeAll(async () => {
  await new Promise<void>((resolve) => gitlabServer.listen(0, '127.0.0.1', resolve))
  gitlabServerUrl = `http://127.0.0.1:${(gitlabServer.address() as AddressInfo).port}`
})

beforeEach(() => {
  gitlabQueries.length = 0
})

afterAll(async () => {
  gitlabServer.close()
  await getKysely().destroy()
})

const INTEGRATION_FRAGMENTS = `
  fragment TaskIntegrationLinkFields on TaskIntegration {
    id
    ...JiraLinkFields
    ...GitLabLinkFields
  }
  fragment JiraLinkFields on JiraIssue {
    issueKey
  }
  fragment GitLabLinkFields on _xGitLabIssue {
    iid
    webUrl
    gitlabState: state
  }
`

const connectGitLab = async ({userId, teamId, cookie}: Awaited<ReturnType<typeof signUp>>) => {
  const res = await sendPublic({
    query: `
      mutation AddIntegrationProvider($input: AddIntegrationProviderInput!) {
        addIntegrationProvider(input: $input) {
          provider {
            id
          }
        }
      }
    `,
    variables: {
      input: {
        teamId,
        service: 'gitlab',
        authStrategy: 'oauth2',
        scope: 'team',
        oAuth2ProviderMetadataInput: {
          serverBaseUrl: gitlabServerUrl,
          clientId: 'gitlab-client',
          clientSecret: 'gitlab-secret'
        }
      }
    },
    cookie
  })
  const {id} = await getKysely()
    .selectFrom('IntegrationProvider')
    .select('id')
    .where('teamId', '=', teamId)
    .where('service', '=', 'gitlab')
    .executeTakeFirstOrThrow()
  expect(res.data.addIntegrationProvider.provider.id).toBeTruthy()
  await getKysely()
    .insertInto('TeamMemberIntegrationAuth')
    .values({
      userId,
      teamId,
      providerId: id,
      service: 'gitlab',
      isActive: true,
      accessToken: 'gitlab-access-token',
      refreshToken: 'gitlab-refresh-token',
      scopes: 'api',
      providerUserId: `gitlab-${userId}`
    })
    .execute()
}

const createTask = async ({userId, teamId, cookie}: Awaited<ReturnType<typeof signUp>>) => {
  const res = await sendPublic({
    query: `
      mutation CreateTask($newTask: CreateTaskInput!) {
        createTask(newTask: $newTask) {
          task {
            id
          }
        }
      }
    `,
    variables: {newTask: {status: 'active', teamId, userId}},
    cookie
  })
  return res.data.createTask.task.id as string
}

const linkTaskToGitLab = (taskId: string, cookie: string) =>
  sendPublic({
    query: `
      mutation CreateTaskIntegration(
        $taskId: ID!
        $integrationRepoId: ID!
        $integrationProviderService: IntegrationProviderServiceEnum!
      ) {
        createTaskIntegration(
          taskId: $taskId
          integrationRepoId: $integrationRepoId
          integrationProviderService: $integrationProviderService
        ) {
          task {
            integration {
              __typename
              ... on _xGitLabIssue {
                title
              }
              ...TaskIntegrationLinkFields
            }
          }
        }
      }
      ${INTEGRATION_FRAGMENTS}
    `,
    variables: {taskId, integrationRepoId: 'acme/widgets', integrationProviderService: 'gitlab'},
    cookie
  })

test('Linking a task to GitLab returns the issue fields its nested fragments select', async () => {
  const viewer = await signUp()
  await connectGitLab(viewer)
  const taskId = await createTask(viewer)

  const res = await linkTaskToGitLab(taskId, viewer.cookie)
  const iid = String(createdIssueCount)
  expect(res).toEqual({
    data: {
      createTaskIntegration: {
        task: {
          integration: {
            __typename: '_xGitLabIssue',
            title: `Widget ${iid}`,
            id: expect.any(String),
            iid,
            webUrl: `https://gitlab.example.com/acme/widgets/-/issues/${iid}`,
            gitlabState: 'opened'
          }
        }
      }
    }
  })
  const issueQueries = gitlabQueries.filter((query) => query.includes('issue(id:'))
  expect(issueQueries).toHaveLength(1)
  expect(issueQueries[0]).not.toContain('issueKey')
})

test('Tasks linked to GitLab issues resolve together through nested fragments', async () => {
  const viewer = await signUp()
  await connectGitLab(viewer)
  const taskIds = [await createTask(viewer), await createTask(viewer)]
  for (const taskId of taskIds) {
    const linked = await linkTaskToGitLab(taskId, viewer.cookie)
    expect(linked.errors).toBeUndefined()
  }
  gitlabQueries.length = 0

  const res = await sendPublic({
    query: `
      query Tasks($teamId: ID!) {
        viewer {
          tasks(first: 10, teamIds: [$teamId]) {
            edges {
              node {
                id
                integration {
                  __typename
                  ...TaskIntegrationLinkFields
                }
              }
            }
          }
        }
      }
      ${INTEGRATION_FRAGMENTS}
    `,
    variables: {teamId: viewer.teamId},
    cookie: viewer.cookie
  })
  expect(res.errors).toBeUndefined()
  const integrations = res.data.viewer.tasks.edges
    .filter(({node}: {node: {id: string}}) => taskIds.includes(node.id))
    .map(({node}: {node: {integration: {iid: string}}}) => node.integration)
  expect(integrations).toHaveLength(2)
  for (const integration of integrations) {
    expect(integration).toEqual({
      __typename: '_xGitLabIssue',
      id: expect.any(String),
      iid: integration.iid,
      webUrl: `https://gitlab.example.com/acme/widgets/-/issues/${integration.iid}`,
      gitlabState: 'opened'
    })
  }
  expect(new Set(integrations.map(({iid}: {iid: string}) => iid)).size).toBe(2)
  expect(gitlabQueries).toEqual([expect.stringContaining('issue_1: issue(id:')])
})
