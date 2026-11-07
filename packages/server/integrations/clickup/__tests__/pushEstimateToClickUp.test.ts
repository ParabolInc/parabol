jest.mock('@whatwg-node/fetch', () => ({
  ...jest.requireActual<typeof import('@whatwg-node/fetch')>('@whatwg-node/fetch'),
  fetch: jest.fn()
}))
jest.mock('../../../postgres/queries/deactivateTeamMemberIntegrationAuthFamily', () => ({
  __esModule: true,
  default: jest.fn()
}))
jest.mock('../../platform/loadDimensionField', () => ({__esModule: true, default: jest.fn()}))

import {fetch, Response} from '@whatwg-node/fetch'
import loadDimensionField from '../../platform/loadDimensionField'
import type {EstimatePushCtx} from '../../platform/ServerIntegrationDefinition'
import type {ClickUpApiCustomField} from '../ClickUpApiTypes'
import type {ClickUpTaskSource} from '../mapClickUpTask'
import pushEstimateToClickUp from '../pushEstimateToClickUp'

const mockFetch = jest.mocked(fetch)
const mockLoadDimensionField = jest.mocked(loadDimensionField)
const {default: actualLoadDimensionField} = jest.requireActual<
  typeof import('../../platform/loadDimensionField')
>('../../platform/loadDimensionField')

const DISCUSSION_URL = 'https://action.parabol.co/meet/meeting1/estimate/1'

const auth = {
  accessToken: 'tok',
  userId: 'user1',
  teamId: 'team1',
  providerId: 7,
  providerUserId: '42'
}

const customFields: ClickUpApiCustomField[] = [
  {id: 'size-field', name: 'Size', type: 'number'},
  {
    id: 'tshirt-field',
    name: 'T-shirt',
    type: 'drop_down',
    type_config: {
      options: [
        {id: 'm-option', name: 'M'},
        {id: 'xl-option', name: 'XL'}
      ]
    }
  },
  {id: 'note-field', name: 'Note', type: 'short_text'}
]

const clickUpTask = {
  service: 'clickup',
  taskId: '86abc',
  listId: '1000',
  spaceId: '10',
  customItemId: 0,
  customFields,
  workspaceId: '9012345'
} as ClickUpTaskSource

const loaders = {
  freshAuth: {load: jest.fn()},
  clickUpTask: {load: jest.fn()},
  clickUpSpace: {load: jest.fn()},
  integrationDimensionFieldMaps: {load: jest.fn()}
}

const buildCtx = (value: string) =>
  ({
    task: {
      id: 'task1',
      teamId: 'team1',
      integration: {
        service: 'clickup',
        accessUserId: 'user1',
        workspaceId: '9012345',
        taskId: '86abc'
      }
    },
    taskEstimate: {dimensionName: 'Story Points', value},
    dataLoader: {get: (name: keyof typeof loaders) => loaders[name]},
    teamId: 'team1',
    userId: 'user1',
    context: {},
    info: {},
    stageId: 'stage1',
    viewerId: 'viewer1',
    meetingName: 'Sprint Poker #3',
    discussionURL: DISCUSSION_URL
  }) as unknown as EstimatePushCtx

type DimensionFieldLookup = Awaited<ReturnType<typeof loadDimensionField>>

const mapDimensionTo = (fieldId: string, fieldName: string | null, fieldType = 'number') => {
  mockLoadDimensionField.mockResolvedValue({
    key: {repoId: '1000', issueType: null},
    field: {fieldId, fieldName, fieldType}
  } as unknown as DimensionFieldLookup)
}

const useStoredMapping = (fieldId: string, fieldName: string, fieldType: string) => {
  mockLoadDimensionField.mockImplementation(actualLoadDimensionField)
  loaders.clickUpSpace.load.mockResolvedValue({
    id: '10',
    name: 'Eng',
    features: {points: {enabled: true}}
  })
  loaders.integrationDimensionFieldMaps.load.mockResolvedValue([
    {issueType: null, fieldId, fieldName, fieldType}
  ])
}

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {status, headers: {'content-type': 'application/json'}})

const readRequest = (callIndex = 0) => {
  const [url, init] = mockFetch.mock.calls[callIndex]!
  return {url, method: init?.method, body: JSON.parse(String(init?.body))}
}

beforeEach(() => {
  mockFetch.mockReset().mockResolvedValue(jsonResponse({}))
  mockLoadDimensionField.mockReset().mockResolvedValue({
    key: {repoId: '1000', issueType: null},
    field: null
  })
  loaders.freshAuth.load.mockReset().mockResolvedValue(auth)
  loaders.clickUpTask.load.mockReset().mockResolvedValue(clickUpTask)
  loaders.clickUpSpace.load.mockReset()
  loaders.integrationDimensionFieldMaps.load.mockReset()
})

describe('pushEstimateToClickUp to Sprint Points', () => {
  it.each([
    ['5', 5],
    ['0', 0]
  ])('sets the task’s points to %p', async (value, points) => {
    mapDimensionTo('__sprintPoints', 'Sprint Points')
    await expect(pushEstimateToClickUp(buildCtx(value))).resolves.toEqual({
      service: 'clickup',
      target: 'field',
      targetId: '__sprintPoints'
    })
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(readRequest()).toEqual({
      url: 'https://api.clickup.com/api/v2/task/86abc',
      method: 'PUT',
      body: {points}
    })
  })

  it('says how to fix a value the workspace’s point scale does not have', async () => {
    mapDimensionTo('__sprintPoints', 'Sprint Points')
    mockFetch.mockResolvedValue(
      jsonResponse({err: 'not a valid points selection', ECODE: 'ITEM_223'}, 400)
    )
    const result = await pushEstimateToClickUp(buildCtx('4'))
    expect(result).toBeInstanceOf(Error)
    expect(result).toHaveProperty(
      'message',
      'ClickUp Sprint Points in this workspace have no "4". Add it to the Sprint Points scale in ClickUp, or push this dimension to a custom field'
    )
  })

  it('refuses a value that is not a number, without calling ClickUp', async () => {
    mapDimensionTo('__sprintPoints', 'Sprint Points')
    const result = await pushEstimateToClickUp(buildCtx('XL'))
    expect(result).toBeInstanceOf(Error)
    expect(result).toHaveProperty('message', 'Sprint Points takes a number, and "XL" is not one')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it.each([
    ['turned off', {points: {enabled: false}}],
    ['not mentioned', {}]
  ])(
    'comments instead, with no error, once Sprint Points is %s in the Space',
    async (_label, features) => {
      useStoredMapping('__sprintPoints', 'Sprint Points', 'number')
      loaders.clickUpSpace.load.mockResolvedValue({id: '10', name: 'Eng', features})
      await expect(pushEstimateToClickUp(buildCtx('5'))).resolves.toBeNull()
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(readRequest().url).toBe('https://api.clickup.com/api/v2/task/86abc/comment')
    }
  )

  it('still sets the task’s points when the Space cannot be read', async () => {
    useStoredMapping('__sprintPoints', 'Sprint Points', 'number')
    loaders.clickUpSpace.load.mockResolvedValue(null)
    await expect(pushEstimateToClickUp(buildCtx('5'))).resolves.toEqual({
      service: 'clickup',
      target: 'field',
      targetId: '__sprintPoints'
    })
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(readRequest()).toEqual({
      url: 'https://api.clickup.com/api/v2/task/86abc',
      method: 'PUT',
      body: {points: 5}
    })
  })

  it.each([
    [401, {err: 'Token invalid', ECODE: 'OAUTH_019'}, 'Reconnect ClickUp: access was revoked'],
    [404, {err: 'Task not found', ECODE: 'ITEM_013'}, 'ClickUp: Task not found']
  ])(
    'passes on, unchanged, the Error of a %p reply to the points',
    async (status, body, message) => {
      mapDimensionTo('__sprintPoints', 'Sprint Points')
      mockFetch.mockResolvedValue(jsonResponse(body, status))
      const result = await pushEstimateToClickUp(buildCtx('5'))
      expect(result).toBeInstanceOf(Error)
      expect(result).toHaveProperty('message', message)
    }
  )
})

describe('pushEstimateToClickUp to a custom field', () => {
  it('sends the id of the dropdown option whose name matches, ignoring case', async () => {
    mapDimensionTo('tshirt-field', 'T-shirt', 'drop_down')
    await expect(pushEstimateToClickUp(buildCtx('xl'))).resolves.toEqual({
      service: 'clickup',
      target: 'field',
      targetId: 'tshirt-field'
    })
    expect(readRequest()).toEqual({
      url: 'https://api.clickup.com/api/v2/task/86abc/field/tshirt-field',
      method: 'POST',
      body: {value: 'xl-option'}
    })
  })

  it('refuses a value no dropdown option is named, without calling ClickUp', async () => {
    mapDimensionTo('tshirt-field', 'T-shirt', 'drop_down')
    const result = await pushEstimateToClickUp(buildCtx('XXL'))
    expect(result).toBeInstanceOf(Error)
    expect(result).toHaveProperty('message', 'T-shirt has no option named "XXL"')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('sends a number to a number field', async () => {
    mapDimensionTo('size-field', 'Size')
    await pushEstimateToClickUp(buildCtx('3'))
    expect(readRequest()).toEqual({
      url: 'https://api.clickup.com/api/v2/task/86abc/field/size-field',
      method: 'POST',
      body: {value: 3}
    })
  })

  it.each(['?', '1/2', 'Infinity'])(
    'refuses %p for a number field, without calling ClickUp',
    async (value) => {
      mapDimensionTo('size-field', 'Size')
      const result = await pushEstimateToClickUp(buildCtx(value))
      expect(result).toBeInstanceOf(Error)
      expect(result).toHaveProperty('message', `Size takes a number, and "${value}" is not one`)
      expect(mockFetch).not.toHaveBeenCalled()
    }
  )

  it('sends the value as it is to a text field', async () => {
    mapDimensionTo('note-field', 'Note', 'string')
    await pushEstimateToClickUp(buildCtx('XL'))
    expect(readRequest().body).toEqual({value: 'XL'})
  })

  it('takes the field’s type from the live task, not from the stored mapping', async () => {
    mapDimensionTo('size-field', 'Size', 'string')
    const result = await pushEstimateToClickUp(buildCtx('XL'))
    expect(result).toHaveProperty('message', 'Size takes a number, and "XL" is not one')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('refuses a stored field that is no longer on the live task', async () => {
    mapDimensionTo('size-field', 'Size')
    loaders.clickUpTask.load.mockResolvedValue({...clickUpTask, customFields: []})
    const result = await pushEstimateToClickUp(buildCtx('3'))
    expect(result).toBeInstanceOf(Error)
    expect(result).toHaveProperty('message', 'Size is no longer on this ClickUp task')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('comments instead, with no error, once the stored field leaves the task', async () => {
    useStoredMapping('size-field', 'Size', 'number')
    loaders.clickUpTask.load.mockResolvedValue({...clickUpTask, customFields: []})
    await expect(pushEstimateToClickUp(buildCtx('3'))).resolves.toBeNull()
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(readRequest()).toMatchObject({
      url: 'https://api.clickup.com/api/v2/task/86abc/comment',
      method: 'POST'
    })
  })

  it('returns the Error of a field value ClickUp refused', async () => {
    mapDimensionTo('size-field', 'Size')
    mockFetch.mockResolvedValue(jsonResponse({err: 'Field does not apply to this task'}, 400))
    const result = await pushEstimateToClickUp(buildCtx('3'))
    expect(result).toBeInstanceOf(Error)
    expect(result).toHaveProperty('message', 'ClickUp: Field does not apply to this task')
  })
})

describe('pushEstimateToClickUp', () => {
  it.each([
    ['no mapping', null],
    ['the comment mapping', '__comment']
  ])('comments on the task, without notifying everyone, for %s', async (_label, fieldId) => {
    if (fieldId) mapDimensionTo(fieldId, null, 'string')
    await expect(pushEstimateToClickUp(buildCtx('5'))).resolves.toBeNull()
    expect(readRequest()).toEqual({
      url: 'https://api.clickup.com/api/v2/task/86abc/comment',
      method: 'POST',
      body: {
        comment_text:
          'Story Points: 5\n\nSee the discussion in Sprint Poker #3: https://action.parabol.co/meet/meeting1/estimate/1\n\nPowered by Parabol: https://www.parabol.co/resources/sprint-poker-meetings',
        notify_all: false
      }
    })
  })

  it('pushes nothing when the dimension is set not to update ClickUp', async () => {
    mapDimensionTo('', null, 'string')
    await expect(pushEstimateToClickUp(buildCtx('5'))).resolves.toBeNull()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('returns the Error of a comment ClickUp refused', async () => {
    mockFetch.mockResolvedValue(jsonResponse({err: 'Task not found', ECODE: 'ITEM_013'}, 404))
    const result = await pushEstimateToClickUp(buildCtx('5'))
    expect(result).toHaveProperty('message', 'ClickUp: Task not found')
  })

  it('returns an Error, without calling ClickUp, when the task cannot be read', async () => {
    mockLoadDimensionField.mockResolvedValue(null)
    const result = await pushEstimateToClickUp(buildCtx('5'))
    expect(result).toHaveProperty('message', 'Cannot read this task from ClickUp')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('returns an Error, without calling ClickUp, when the connection is gone', async () => {
    loaders.freshAuth.load.mockResolvedValue(null)
    const result = await pushEstimateToClickUp(buildCtx('5'))
    expect(result).toHaveProperty('message', 'User no longer has access to ClickUp')
    expect(mockFetch).not.toHaveBeenCalled()
  })
})
