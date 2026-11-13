import type {GraphQLResolveInfo} from 'graphql'
import {getNewDataLoader} from '../../../../dataloader/getNewDataLoader'
import generateUID from '../../../../generateUID'
import getKysely from '../../../../postgres/getKysely'
import type {GQLContext} from '../../../graphql'
import RetroDiscussStage, {type DiscussStageSource} from '../RetroDiscussStage'

const pg = getKysely()
const suffix = generateUID()
const orgId = `discussStageOrg${suffix}`
const teamId = `discussStageTeam${suffix}`
const promptsCreatedAt = new Date('2024-01-01')
const templateRemovedAt = new Date('2024-06-01')

const insertTemplate = async (name: string, removedAt: Date | null) => {
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
      isActive: !removedAt
    })
    .execute()
  await pg
    .insertInto('TemplatePrompt')
    .values(
      ['Went well', 'To improve'].map((question, idx) => ({
        id: `${templateId}:${idx}`,
        teamId,
        templateId,
        question,
        description: '',
        groupColor: '#66BC8C',
        sortOrder: String(idx),
        createdAt: promptsCreatedAt,
        removedAt
      }))
    )
    .execute()
  return templateId
}

const insertMeeting = async (templateId: string, createdAt: Date) => {
  const meetingId = `discussStageMeeting${generateUID()}`
  await pg
    .insertInto('NewMeeting')
    .values({
      id: meetingId,
      teamId,
      templateId,
      createdAt,
      meetingType: 'retrospective',
      name: 'Retro',
      meetingCount: 1,
      meetingNumber: 1,
      facilitatorStageId: 'stage1',
      phases: JSON.stringify([])
    })
    .execute()
  return meetingId
}

const resolvePlaceholderGroup = async (meetingId: string) => {
  const resolve = RetroDiscussStage.reflectionGroup
  if (typeof resolve !== 'function') throw new Error('resolver must be a function')
  const dataLoader = getNewDataLoader('RetroDiscussStage.test')
  try {
    return await resolve(
      {meetingId, teamId, reflectionGroupId: ''} as DiscussStageSource,
      {},
      {dataLoader} as unknown as GQLContext,
      {} as GraphQLResolveInfo
    )
  } finally {
    dataLoader.dispose()
  }
}

beforeAll(async () => {
  await pg.insertInto('Organization').values({id: orgId, name: 'Discuss Stage Org'}).execute()
  await pg.insertInto('Team').values({id: teamId, name: 'Discuss Stage Team', orgId}).execute()
})

afterAll(async () => {
  await pg.deleteFrom('Team').where('id', '=', teamId).execute()
  await pg.deleteFrom('Organization').where('id', '=', orgId).execute()
})

test('a meeting older than its template’s prompts still resolves its placeholder discuss stage', async () => {
  const templateId = await insertTemplate('rewrittenTemplate', null)
  const meetingId = await insertMeeting(templateId, new Date('2021-02-08'))
  const group = await resolvePlaceholderGroup(meetingId)
  expect(group).toMatchObject({id: `${meetingId}:dummyGroup`, promptId: `${templateId}:0`})
})

test('a meeting started after its template was removed still resolves its placeholder discuss stage', async () => {
  const templateId = await insertTemplate('removedTemplate', templateRemovedAt)
  const meetingId = await insertMeeting(templateId, new Date('2024-07-01'))
  const group = await resolvePlaceholderGroup(meetingId)
  expect(group).toMatchObject({id: `${meetingId}:dummyGroup`, promptId: `${templateId}:0`})
})

test('a meeting with prompts from when it started does not see a prompt added after', async () => {
  const templateId = await insertTemplate('frozenTemplate', null)
  const meetingId = await insertMeeting(templateId, new Date('2024-02-01'))
  await pg
    .insertInto('TemplatePrompt')
    .values({
      id: `${templateId}:later`,
      teamId,
      templateId,
      question: 'Added later',
      description: '',
      groupColor: '#66BC8C',
      sortOrder: '!',
      createdAt: new Date('2024-03-01')
    })
    .execute()
  const dataLoader = getNewDataLoader('RetroDiscussStage.test')
  const prompts = await dataLoader.get('templatePromptsByMeetingId').load(meetingId)
  dataLoader.dispose()
  expect(prompts.map(({id}) => id)).toEqual([`${templateId}:0`, `${templateId}:1`])
})
