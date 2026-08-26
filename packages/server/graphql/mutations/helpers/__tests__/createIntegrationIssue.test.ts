import type {GraphQLResolveInfo} from 'graphql'
import type {GQLContext} from '../../../graphql'
import createIntegrationIssue from '../createIntegrationIssue'

const initManager = jest.fn()
jest.mock('../../../../integrations/platform/registry', () => ({
  getServerIntegration: (service: string) =>
    service === 'github' ? {title: 'GitHub', capabilities: {issueCreate: {initManager}}} : null
}))

const context = {dataLoader: {}} as GQLContext
const info = {} as GraphQLResolveInfo
const content = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {type: 'text', text: 'Fix it '},
        {type: 'taskTag', attrs: {id: 'bug'}}
      ]
    }
  ]
}

describe('createIntegrationIssue', () => {
  beforeEach(() => jest.clearAllMocks())

  it('is empty when the task has no integration', async () => {
    await expect(createIntegrationIssue(null, content, 'u1', 't1', context, info)).resolves.toEqual(
      {
        integrationHash: undefined,
        integration: undefined,
        integrationRepoId: undefined
      }
    )
  })

  it('rejects a service the registry does not know', async () => {
    const res = await createIntegrationIssue(
      {service: 'PARABOL', serviceProjectHash: ''},
      content,
      'u1',
      't1',
      context,
      info
    )
    expect(res.error?.message).toBe('Unknown integration')
  })

  it('names the service when the viewer has no usable auth', async () => {
    initManager.mockResolvedValue(null)
    const res = await createIntegrationIssue(
      {service: 'github', serviceProjectHash: 'org/repo'},
      content,
      'u1',
      't1',
      context,
      info
    )
    expect(res.error?.message).toBe('Cannot create GitHub task without a valid GitHub token')
  })

  it('creates the issue with tag chips stripped and records the caller repo hash', async () => {
    const createTask = jest.fn().mockResolvedValue({
      integrationHash: 'org/repo:7',
      issueId: 'I_7',
      integration: {
        service: 'github',
        nameWithOwner: 'org/repo',
        issueNumber: 7,
        accessUserId: 'u1'
      }
    })
    initManager.mockResolvedValue({createTask})
    const res = await createIntegrationIssue(
      {service: 'github', serviceProjectHash: 'org/repo'},
      content,
      'u1',
      't1',
      context,
      info
    )
    expect(initManager).toHaveBeenCalledWith({
      dataLoader: context.dataLoader,
      teamId: 't1',
      userId: 'u1',
      context,
      info
    })
    const {rawContentJSON, integrationRepoId} = createTask.mock.calls[0]![0]
    expect(integrationRepoId).toBe('org/repo')
    expect(JSON.stringify(rawContentJSON)).not.toContain('taskTag')
    expect(res).toEqual({
      integrationHash: 'org/repo:7',
      integration: {
        service: 'github',
        nameWithOwner: 'org/repo',
        issueNumber: 7,
        accessUserId: 'u1'
      },
      integrationRepoId: 'org/repo'
    })
  })

  it('surfaces the manager error', async () => {
    initManager.mockResolvedValue({createTask: jest.fn().mockResolvedValue(new Error('boom'))})
    const res = await createIntegrationIssue(
      {service: 'github', serviceProjectHash: 'org/repo'},
      content,
      'u1',
      't1',
      context,
      info
    )
    expect(res.error?.message).toBe('boom')
  })
})
