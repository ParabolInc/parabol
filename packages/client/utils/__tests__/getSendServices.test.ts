jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))

import type {IntegrationProviderServiceEnum} from '../../__generated__/CreateTaskIntegrationMutation.graphql'
import {DEFAULT_SEND_SERVICES, getSendServices, getSendToLabel} from '../getSendServices'

const connected = (...services: IntegrationProviderServiceEnum[]) =>
  services.map((service) => ({service, isConnected: true}))

describe('getSendServices', () => {
  it('shows the viewer’s connected tools in popularity order, up to three', () => {
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

  it('shows Jira, GitHub and GitLab when the viewer has nothing connected', () => {
    expect(getSendServices([])).toEqual(DEFAULT_SEND_SERVICES)
    expect(
      getSendServices(DEFAULT_SEND_SERVICES.map((service) => ({service, isConnected: false})))
    ).toEqual(['jira', 'github', 'gitlab'])
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
