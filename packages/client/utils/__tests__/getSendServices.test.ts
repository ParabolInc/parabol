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
  it('keeps the org’s most used tools first, up to three', () => {
    expect(getOrgSendServices(['gitlab', 'linear', 'github', 'jira'])).toEqual([
      'gitlab',
      'linear',
      'github'
    ])
  })

  it('leaves out Parabol tasks', () => {
    expect(getOrgSendServices(['PARABOL', 'jira'])).toEqual(['jira'])
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
