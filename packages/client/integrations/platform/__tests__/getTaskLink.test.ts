jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))
jest.mock('relay-runtime', () => ({
  ...jest.requireActual('relay-runtime'),
  readInlineData: (_fragment: unknown, fragmentRef: unknown) => fragmentRef
}))

import type {TaskIntegrationLink_integration$data} from '../../../__generated__/TaskIntegrationLink_integration.graphql'
import getTaskLink from '../getTaskLink'

const linked = (alias: string, data: object) =>
  ({id: 'integration', [alias]: data}) as unknown as TaskIntegrationLink_integration$data

const jira = (status: string | null) =>
  linked('jiraTaskLink_issue', {
    issueKey: 'COPPER-142',
    projectKey: 'COPPER',
    cloudName: 'copper',
    jiraStatus: status ? {name: status} : null
  })

const gitLab = (state: string) =>
  linked('gitLabTaskLink_issue', {
    iid: '7',
    webPath: '/copper/deploy/-/issues/7',
    webUrl: 'https://gitlab.com/copper/deploy/-/issues/7',
    gitlabState: state
  })

describe('getTaskLink', () => {
  it('asks the integration that owns the linked issue, and shows its status as the tool names it', () => {
    expect(getTaskLink(jira('In Review'))).toEqual({
      service: 'jira',
      href: 'https://copper.atlassian.net/browse/COPPER-142',
      label: 'Issue #COPPER-142',
      title: 'Jira Issue #COPPER-142 on COPPER',
      status: 'In Review'
    })
  })

  it('has no status when the issue came back without one', () => {
    expect(getTaskLink(jira(null))?.status).toBeNull()
  })

  it('words GitLab and GitHub states for people', () => {
    expect(getTaskLink(gitLab('opened'))?.status).toBe('Open')
    expect(getTaskLink(gitLab('closed'))?.status).toBe('Closed')
    expect(getTaskLink(gitLab('all'))?.status).toBeNull()
    const gitHub = linked('gitHubTaskLink_issue', {
      number: 318,
      githubState: 'CLOSED',
      repository: {nameWithOwner: 'copper-co/deploy-tools'}
    })
    expect(getTaskLink(gitHub)).toMatchObject({service: 'github', status: 'Closed'})
  })

  it('passes other tools’ own status names through', () => {
    const azure = linked('azureDevOpsTaskLink_workItem', {
      workItemKey: '42',
      azureProject: {organization: 'copper', name: 'Deploy'},
      type: 'Bug',
      azureState: 'Resolved',
      url: 'https://dev.azure.com/copper/Deploy/_workitems/edit/42'
    })
    expect(getTaskLink(azure)).toMatchObject({
      service: 'azureDevOps',
      label: 'Bug #copper:42',
      status: 'Resolved'
    })
    const clickUp = linked('clickUpTaskLink_task', {
      taskId: '86abc123',
      customId: 'ENG-12',
      listName: 'Sprint 4',
      folderName: null,
      clickUpUrl: 'https://app.clickup.com/t/86abc123',
      clickUpStatus: {name: 'in progress'}
    })
    expect(getTaskLink(clickUp)).toMatchObject({
      service: 'clickup',
      label: 'Task ENG-12',
      status: 'in progress'
    })
  })

  it('is null for an issue no integration claims', () => {
    expect(getTaskLink(linked('unknown', {}))).toBeNull()
  })
})
