jest.mock('@whatwg-node/fetch', () => ({
  ...jest.requireActual<typeof import('@whatwg-node/fetch')>('@whatwg-node/fetch'),
  fetch: jest.fn()
}))
jest.mock('../../../postgres/queries/deactivateTeamMemberIntegrationAuthFamily', () => ({
  __esModule: true,
  default: jest.fn()
}))

import {fetch, Response} from '@whatwg-node/fetch'
import type {TipTapSerializedContent} from 'parabol-client/shared/tiptap/TipTapSerializedContent'
import type {TeamMemberIntegrationAuth} from '../../../postgres/types'
import ClickUpServerManager from '../ClickUpServerManager'

const mockFetch = jest.mocked(fetch)

const auth = {
  accessToken: 'tok',
  userId: 'user1',
  teamId: 'team1',
  providerId: 7,
  providerUserId: '42'
} as TeamMemberIntegrationAuth

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {status, headers: {'content-type': 'application/json'}})

const readRequest = (callIndex = 0) => {
  const [url, init] = mockFetch.mock.calls[callIndex]!
  return {url, method: init?.method, body: JSON.parse(String(init?.body))}
}

const manager = new ClickUpServerManager(auth)

beforeEach(() => {
  mockFetch.mockReset()
})

test('ClickUpServerManager.createTask sends markdown_content and builds the hash from team_id', async () => {
  mockFetch.mockResolvedValueOnce(
    jsonResponse({id: '86abc', team_id: '9012345', name: 'Fix the build', list: {id: '1000'}})
  )
  const bodyContent: TipTapSerializedContent = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {type: 'text', text: 'Steps', marks: [{type: 'bold'}]},
          {type: 'text', text: ' to repro'}
        ]
      }
    ]
  }
  await expect(
    manager.createTask({title: 'Fix the build', bodyContent, integrationRepoId: '1000'})
  ).resolves.toEqual({
    integrationHash: '9012345::86abc',
    issueId: '86abc',
    integration: {
      service: 'clickup',
      accessUserId: 'user1',
      workspaceId: '9012345',
      taskId: '86abc'
    }
  })
  expect(readRequest()).toEqual({
    url: 'https://api.clickup.com/api/v2/list/1000/task',
    method: 'POST',
    body: {name: 'Fix the build', markdown_content: '**Steps** to repro'}
  })
})

test('ClickUpServerManager.createTask sends only the name when the title says it all', async () => {
  mockFetch.mockResolvedValueOnce(jsonResponse({id: '86abc', team_id: '9012345'}))
  await manager.createTask({title: 'Fix the build', bodyContent: null, integrationRepoId: '1000'})
  expect(readRequest().body).toEqual({name: 'Fix the build'})
})

test.each(['..', '1000/../../team', 'abc', ''])(
  'ClickUpServerManager.createTask refuses the list id %p without calling ClickUp',
  async (integrationRepoId) => {
    const result = await manager.createTask({
      title: 'Fix the build',
      bodyContent: null,
      integrationRepoId
    })
    expect(result).toBeInstanceOf(Error)
    expect(mockFetch).not.toHaveBeenCalled()
  }
)

test('ClickUpServerManager.createTask returns an Error when ClickUp answers without the task ids', async () => {
  mockFetch.mockResolvedValueOnce(jsonResponse({name: 'Fix the build'}))
  const result = await manager.createTask({
    title: 'Fix the build',
    bodyContent: null,
    integrationRepoId: '1000'
  })
  expect(result).toBeInstanceOf(Error)
})

test('ClickUpServerManager.addCreatedBySomeoneElseComment posts plain text naming the creator, the assignee and the dashboard, with notify_all false', async () => {
  mockFetch.mockResolvedValueOnce(jsonResponse({id: '458', hist_id: '26508', date: 1568036964079}))
  const result = await manager.addCreatedBySomeoneElseComment(
    'Ada',
    'Grace',
    'Platform',
    'https://action.parabol.co/team/team1',
    '86abc',
    '9012345::86abc'
  )
  expect(result).toBe('458')
  expect(readRequest()).toEqual({
    url: 'https://api.clickup.com/api/v2/task/86abc/comment',
    method: 'POST',
    body: {
      comment_text:
        'Created by Ada for Grace\n\nSee the dashboard of Platform: https://action.parabol.co/team/team1\n\nPowered by Parabol: https://www.parabol.co/integrations',
      notify_all: false
    }
  })
})

test('ClickUpServerManager.addCreatedBySomeoneElseComment returns the Error, naming the workspace, instead of throwing', async () => {
  mockFetch.mockResolvedValueOnce(
    jsonResponse({err: 'Team not authorized', ECODE: 'OAUTH_027'}, 401)
  )
  const result = await manager.addCreatedBySomeoneElseComment(
    'Ada',
    'Grace',
    'Platform',
    'https://action.parabol.co/team/team1',
    '86abc',
    '9012345::86abc'
  )
  expect(result).toBeInstanceOf(Error)
  expect((result as Error).message).toBe(
    'ClickUp workspace 9012345 is not shared with Parabol. Reconnect ClickUp and select it'
  )
})
