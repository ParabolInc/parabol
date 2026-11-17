jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))

import type {IntegrationProviderServiceEnum} from '../../__generated__/CreateTaskIntegrationMutation.graphql'
import {
  getConnectLabel,
  getOrgSendServices,
  getSendServices,
  getSendToLabel,
  SUGGESTED_SEND_SERVICES
} from '../getSendServices'

const connected = (...services: IntegrationProviderServiceEnum[]) =>
  services.map((service) => ({service, isConnected: true}))

describe('getSendServices', () => {
  it('lists the viewer’s connected tools in popularity order, up to three', () => {
    const viewer = connected('gitlab', 'github', 'clickup', 'linear', 'jira')
    expect(getSendServices(viewer)).toEqual(['jira', 'linear', 'github'])
  })

  it('ignores tools the viewer has not connected and ones a task cannot go to', () => {
    const viewer = [
      {service: 'jira' as const, isConnected: false},
      ...connected('gcal', 'mattermost', 'azureDevOps')
    ]
    expect(getSendServices(viewer)).toEqual(['azureDevOps'])
  })

  it('is empty when the viewer has nothing connected', () => {
    expect(getSendServices([])).toEqual([])
    expect(getSendServices([{service: 'github', isConnected: false}])).toEqual([])
  })
})

describe('getSendToLabel', () => {
  it('names one, two or three tools', () => {
    expect(getSendToLabel(['jira'])).toBe('Send to Jira Cloud')
    expect(getSendToLabel(['jira', 'github'])).toBe('Send to Jira Cloud or GitHub')
    expect(getSendToLabel(['jira', 'github', 'gitlab'])).toBe(
      'Send to Jira Cloud, GitHub or GitLab'
    )
  })
})

describe('getOrgSendServices', () => {
  it('lists the tools the org sends tasks to, most used first, up to three', () => {
    const counts = [
      {service: 'github' as const, taskCount: 4},
      {service: 'gitlab' as const, taskCount: 40},
      {service: 'linear' as const, taskCount: 9},
      {service: 'jira' as const, taskCount: 2}
    ]
    expect(getOrgSendServices(counts)).toEqual(['gitlab', 'linear', 'github'])
  })

  it('leaves out Parabol tasks and tools with no tasks', () => {
    const counts = [
      {service: 'PARABOL' as const, taskCount: 90},
      {service: 'jira' as const, taskCount: 0}
    ]
    expect(getOrgSendServices(counts)).toEqual([])
  })
})

describe('getConnectLabel', () => {
  it('names the tools it suggests and leaves room for others', () => {
    expect(getConnectLabel(SUGGESTED_SEND_SERVICES)).toBe(
      'Connect Jira Cloud, GitHub, GitLab or another tool to send this task'
    )
    expect(getConnectLabel(['gitlab'])).toBe('Connect GitLab or another tool to send this task')
  })
})
