import type {GraphQLResolveInfo} from 'graphql'
import {SprintPokerDefaults} from 'parabol-client/types/constEnums'
import type {GQLContext} from '../../../graphql/graphql'
import resolveServiceField, {
  COMMENT_SERVICE_FIELD,
  NULL_SERVICE_FIELD
} from '../resolveServiceField'

const listDimensionFields = jest.fn()
const resolveDimensionFieldKey = jest.fn()
jest.mock('../registry', () => ({
  getServerIntegration: () => ({
    capabilities: {
      estimatePush: {listDimensionFields, resolveDimensionFieldKey, targets: ['comment', 'field']}
    }
  })
}))

const rows: unknown[] = []
const dataLoader = {
  get: () => ({load: async () => rows})
}

const buildCtx = (integration: unknown) =>
  ({
    dataLoader,
    teamId: 'team1',
    userId: 'user1',
    viewerId: 'user1',
    context: {} as GQLContext,
    info: {} as GraphQLResolveInfo,
    task: {id: 'task1', integration},
    dimensionName: 'Story Points'
  }) as unknown as Parameters<typeof resolveServiceField>[0]

describe('resolveServiceField', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    rows.length = 0
    resolveDimensionFieldKey.mockResolvedValue({repoId: 'repo1', issueType: null})
    listDimensionFields.mockResolvedValue({
      options: [{fieldId: '__storyPoints', label: 'Story point estimate', type: 'string'}]
    })
  })

  it('is the do-not-update sentinel without an integration or a mapping key', async () => {
    await expect(resolveServiceField(buildCtx(null))).resolves.toEqual(NULL_SERVICE_FIELD)
    resolveDimensionFieldKey.mockResolvedValue(null)
    await expect(resolveServiceField(buildCtx({service: 'jira'}))).resolves.toEqual(
      NULL_SERVICE_FIELD
    )
  })

  it('is the comment sentinel when no row is stored', async () => {
    await expect(resolveServiceField(buildCtx({service: 'jira'}))).resolves.toEqual(
      COMMENT_SERVICE_FIELD
    )
  })

  it('labels a stored sentinel without consulting the listing', async () => {
    rows.push({
      fieldId: SprintPokerDefaults.SERVICE_FIELD_NULL,
      fieldName: null,
      fieldType: 'string',
      issueType: null
    })
    await expect(resolveServiceField(buildCtx({service: 'jira'}))).resolves.toEqual(
      NULL_SERVICE_FIELD
    )
    expect(listDimensionFields).not.toHaveBeenCalled()
  })

  it('uses the stored fieldName as the label when the service stored one', async () => {
    rows.push({
      fieldId: 'customfield_1',
      fieldName: 'Story Points',
      fieldType: 'number',
      issueType: null
    })
    await expect(resolveServiceField(buildCtx({service: 'jira'}))).resolves.toEqual({
      fieldId: 'customfield_1',
      label: 'Story Points',
      type: 'number'
    })
    expect(listDimensionFields).not.toHaveBeenCalled()
  })

  it('looks a nameless id up in the listing', async () => {
    rows.push({fieldId: '__storyPoints', fieldName: null, fieldType: 'string', issueType: null})
    await expect(resolveServiceField(buildCtx({service: 'jira'}))).resolves.toEqual({
      fieldId: '__storyPoints',
      label: 'Story point estimate',
      type: 'string'
    })
  })

  it('labels an unlisted nameless id with the id itself', async () => {
    rows.push({fieldId: 'Points: {{#}}', fieldName: null, fieldType: 'string', issueType: null})
    await expect(resolveServiceField(buildCtx({service: 'jira'}))).resolves.toEqual({
      fieldId: 'Points: {{#}}',
      label: 'Points: {{#}}',
      type: 'string'
    })
  })
})
