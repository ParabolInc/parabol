import type {GraphQLResolveInfo} from 'graphql'
import {activeEmbeddingModelId} from '../../../../../embedder/activeEmbeddingModel'
import {getEmbeddingsTableName} from '../../../../../embedder/getEmbeddingsTableName'
import numberVectorToString from '../../../../../embedder/indexing/numberVectorToString'
import {getNewDataLoader} from '../../../../dataloader/getNewDataLoader'
import generateUID from '../../../../generateUID'
import getKysely from '../../../../postgres/getKysely'
import type {User as UserType} from '../../../../postgres/types'
import type {GQLContext} from '../../../graphql'
import {publishToEmbedder} from '../../../mutations/helpers/publishToEmbedder'
import User from '../User'

jest.mock('../../../mutations/helpers/publishToEmbedder', () => ({
  getUserQueryJobData: jest.fn(),
  publishToEmbedder: jest.fn()
}))

const mockActiveDefinition: {templateSearchFloor?: number; templateSearchGap?: number} = {}
jest.mock('../../../../../embedder/activeEmbeddingModel', () => {
  const actual = jest.requireActual<typeof import('../../../../../embedder/activeEmbeddingModel')>(
    '../../../../../embedder/activeEmbeddingModel'
  )
  return {
    ...actual,
    get activeEmbeddingDefinition() {
      return {...actual.activeEmbeddingDefinition, ...mockActiveDefinition}
    }
  }
})

const pg = getKysely()
const tableName = getEmbeddingsTableName(activeEmbeddingModelId)
const suffix = generateUID()
const orgId = `templateSearchOrg${suffix}`
const teamId = `templateSearchTeam${suffix}`
const userId = `templateSearchUser${suffix}`
const search = `templateSearch ${suffix}`

const vectorAt = (cosine: number) =>
  Array.from({length: 1024}, (_, index) =>
    index === 0 ? cosine : index === 1 ? Math.sqrt(1 - cosine * cosine) : 0
  )

const insertTemplate = async (name: string, cosine: number) => {
  const templateId = `${name}${suffix}`
  await pg
    .insertInto('MeetingTemplate')
    .values({
      id: templateId,
      name,
      teamId,
      orgId,
      scope: 'TEAM',
      type: 'retrospective',
      mainCategory: 'retrospective',
      illustrationUrl: 'https://example.com/template.png',
      isStarter: false,
      isFree: true
    })
    .execute()
  const {id} = await pg
    .insertInto('EmbeddingsMetadata')
    .values({objectType: 'meetingTemplate', refId: templateId, teamId, language: 'en'})
    .returning('id')
    .executeTakeFirstOrThrow()
  await pg
    .insertInto(tableName)
    .values({
      embeddingsMetadataId: id,
      embedding: numberVectorToString(vectorAt(cosine)),
      chunkNumber: null,
      tsv: ''
    })
    .execute()
  return templateId
}

const callTemplateSearch = async () => {
  const dataLoader = getNewDataLoader('templateSearchTest')
  const {templateSearch} = User
  if (typeof templateSearch !== 'function') throw new Error('templateSearch must be a function')
  const results = await templateSearch(
    {id: userId} as UserType,
    {search},
    {authToken: {sub: userId, tms: [teamId]}, dataLoader} as unknown as GQLContext,
    {} as GraphQLResolveInfo
  )
  dataLoader.dispose()
  return (results as {name: string}[]).map(({name}) => name)
}

beforeAll(async () => {
  await pg
    .insertInto('Organization')
    .values({id: orgId, name: 'Search org', tier: 'team'})
    .execute()
  await pg.insertInto('Team').values({id: teamId, name: 'Search team', orgId}).execute()
  await pg
    .insertInto('User')
    .values({
      id: userId,
      email: `${userId}@example.com`,
      picture: 'https://example.com/pic.png',
      preferredName: 'Template Searcher'
    })
    .execute()
  await pg
    .insertInto('TeamMember')
    .values({
      id: `${userId}::${teamId}`,
      teamId,
      userId
    })
    .execute()
  await pg.insertInto('OrganizationUser').values({id: generateUID(), orgId, userId}).execute()
  await insertTemplate('close', 0.8)
  await insertTemplate('near', 0.76)
  await insertTemplate('weak', 0.6)
  await insertTemplate('offTopic', 0.3)
  jest.mocked(publishToEmbedder).mockResolvedValue(Float32Array.from(vectorAt(1)))
})

afterAll(async () => {
  await pg.deleteFrom('EmbeddingsMetadata').where('teamId', '=', teamId).execute()
  await pg.deleteFrom('MeetingTemplate').where('teamId', '=', teamId).execute()
  await pg.deleteFrom('OrganizationUser').where('orgId', '=', orgId).execute()
  await pg.deleteFrom('TeamMember').where('teamId', '=', teamId).execute()
  await pg.deleteFrom('User').where('id', '=', userId).execute()
  await pg.deleteFrom('Team').where('id', '=', teamId).execute()
  await pg.deleteFrom('Organization').where('id', '=', orgId).execute()
  await pg.destroy()
})

it("cuts results off at the active model's floor and gap", async () => {
  mockActiveDefinition.templateSearchFloor = 0.35
  mockActiveDefinition.templateSearchGap = 0.05
  const names = await callTemplateSearch()
  expect(names).toEqual(expect.arrayContaining(['close', 'near']))
  expect(names).not.toContain('weak')
  expect(names).not.toContain('offTopic')
})

it('widens with a bigger gap, down to the floor', async () => {
  mockActiveDefinition.templateSearchFloor = 0.35
  mockActiveDefinition.templateSearchGap = 0.5
  const names = await callTemplateSearch()
  expect(names).toEqual(expect.arrayContaining(['close', 'near', 'weak']))
  expect(names).not.toContain('offTopic')
})

it('finds nothing when the best match is under the floor', async () => {
  mockActiveDefinition.templateSearchFloor = 0.9
  mockActiveDefinition.templateSearchGap = 0.05
  expect(await callTemplateSearch()).toEqual([])
})
