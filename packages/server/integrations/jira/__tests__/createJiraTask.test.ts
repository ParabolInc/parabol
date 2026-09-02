import type {AtlassianAuth} from '../../../postgres/types'
import AtlassianServerManager from '../../../utils/AtlassianServerManager'
import createJiraTask from '../createJiraTask'

jest.mock('../../../utils/AtlassianServerManager')

const getCreateMeta = jest.fn()
const createIssue = jest.fn()
const MockedManager = AtlassianServerManager as jest.MockedClass<typeof AtlassianServerManager>

const auth = {accessToken: 'token', providerUserId: 'atlassian-account'} as AtlassianAuth
const content = {
  type: 'doc',
  content: [{type: 'paragraph', content: [{type: 'text', text: 'Fix the widget'}]}]
}
const cloudId = 'cloud-1'
const projectKey = 'AO'

const meta = (fields: Record<string, unknown> | undefined) => ({
  projects: [{key: projectKey, issuetypes: [{id: '10001', name: 'Task', fields}]}]
})

const screenField = {required: false, name: '', key: '', hasDefaultValue: false, operations: []}

describe('createJiraTask', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    MockedManager.mockImplementation(
      () => ({getCreateMeta, createIssue}) as unknown as AtlassianServerManager
    )
    createIssue.mockResolvedValue({id: '1', key: `${projectKey}-7`})
  })

  it('sends a summary without the #tag chip', async () => {
    getCreateMeta.mockResolvedValue(meta(undefined))
    await createJiraTask(
      {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {type: 'text', text: 'Fix the widget '},
              {type: 'taskTag', attrs: {id: 'private', label: null, mentionSuggestionChar: '#'}}
            ]
          }
        ]
      },
      cloudId,
      projectKey,
      auth
    )
    const payload = createIssue.mock.calls[0]![2]
    expect(payload.summary).toBe('Fix the widget')
    expect(JSON.stringify(payload.description)).not.toContain('private')
  })

  it('asks Jira which fields are on the create screen', async () => {
    getCreateMeta.mockResolvedValue(meta({summary: screenField}))
    await createJiraTask(content, cloudId, projectKey, auth)
    expect(getCreateMeta).toHaveBeenCalledWith(cloudId, [projectKey], true)
  })

  it('sends assignee, labels and description when the screen has them', async () => {
    getCreateMeta.mockResolvedValue(
      meta({
        summary: screenField,
        assignee: screenField,
        labels: screenField,
        description: screenField
      })
    )
    const res = await createJiraTask(content, cloudId, projectKey, auth)
    expect(res).toEqual({issueKey: `${projectKey}-7`})
    expect(createIssue).toHaveBeenCalledWith(
      cloudId,
      projectKey,
      expect.objectContaining({
        summary: 'Fix the widget',
        assignee: {id: 'atlassian-account'},
        labels: ['parabol'],
        description: expect.any(Object),
        issuetype: {id: '10001'}
      })
    )
  })

  it('omits fields the create screen does not have', async () => {
    getCreateMeta.mockResolvedValue(meta({summary: screenField, description: screenField}))
    await createJiraTask(content, cloudId, projectKey, auth)
    const payload = createIssue.mock.calls[0]![2]
    expect(payload).not.toHaveProperty('assignee')
    expect(payload).not.toHaveProperty('labels')
    expect(payload).toHaveProperty('description')
  })

  it('sends every field when Jira returns no field metadata', async () => {
    getCreateMeta.mockResolvedValue(meta(undefined))
    await createJiraTask(content, cloudId, projectKey, auth)
    const payload = createIssue.mock.calls[0]![2]
    expect(payload).toMatchObject({assignee: {id: 'atlassian-account'}, labels: ['parabol']})
  })

  it('surfaces the createIssue error', async () => {
    getCreateMeta.mockResolvedValue(meta(undefined))
    createIssue.mockResolvedValue(new Error('boom'))
    const res = await createJiraTask(content, cloudId, projectKey, auth)
    expect(res).toEqual({error: new Error('boom')})
  })
})
