import {getNewDataLoader} from '../../../../../dataloader/getNewDataLoader'
import generateUID from '../../../../../generateUID'
import getKysely from '../../../../../postgres/getKysely'
import getPubSub from '../../../../../utils/getPubSub'
import getRedis from '../../../../../utils/getRedis'
import {createNewPage} from '../../../../../utils/tiptap/createNewPage'
import {ensureMeetingTOCPage} from '../ensureMeetingTOCPage'
import {removeMeetingTOCAccess} from '../removeMeetingTOCAccess'

jest.mock('../../../../../utils/publishPageNotification', () => ({
  publishPageNotification: async () => {}
}))
jest.mock('../../../../../utils/analytics/analytics', () => ({
  analytics: {pageCreated: () => {}}
}))

const pg = getKysely()
const orgId = `tocOrg|${generateUID()}`
const teamId = `tocTeam|${generateUID()}`
const leadId = `tocLead|${generateUID()}`
const enderId = `tocEnder|${generateUID()}`
const memberId = `tocMember|${generateUID()}`
const userIds = [leadId, enderId, memberId]
const meetingId = `tocMeeting|${generateUID()}`

const getRoles = async (pageId: number) => {
  const rows = await pg
    .selectFrom('PageAccess')
    .select(['userId', 'role'])
    .where('pageId', '=', pageId)
    .execute()
  return Object.fromEntries(rows.map(({userId, role}) => [userId, role]))
}

beforeAll(async () => {
  await pg
    .insertInto('User')
    .values(
      userIds.map((id) => ({
        id,
        email: `${id}@example.com`,
        picture: 'https://example.com/pic.png',
        preferredName: id
      }))
    )
    .execute()
  await pg.insertInto('Organization').values({id: orgId, name: 'TOC Org'}).execute()
  await pg.insertInto('Team').values({id: teamId, name: 'TOC Team', orgId}).execute()
  await pg
    .insertInto('TeamMember')
    .values(
      userIds.map((userId) => ({
        id: `${teamId}::${userId}`,
        teamId,
        userId,
        isLead: userId === leadId
      }))
    )
    .execute()
  await pg
    .insertInto('NewMeeting')
    .values({
      id: meetingId,
      teamId,
      facilitatorStageId: 'stage1',
      facilitatorUserId: enderId,
      meetingType: 'retrospective',
      name: 'Retro 1',
      meetingCount: 1,
      meetingNumber: 1,
      phases: JSON.stringify([])
    })
    .execute()
})

afterAll(async () => {
  await pg.updateTable('Team').set({meetingTOCpageId: null}).where('id', '=', teamId).execute()
  await pg.deleteFrom('Page').where('userId', 'in', userIds).execute()
  await pg.deleteFrom('NewMeeting').where('id', '=', meetingId).execute()
  await pg.deleteFrom('TeamMember').where('teamId', '=', teamId).execute()
  await pg.deleteFrom('Team').where('id', '=', teamId).execute()
  await pg.deleteFrom('Organization').where('id', '=', orgId).execute()
  await pg.deleteFrom('User').where('id', 'in', userIds).execute()
  const pubSub = getPubSub()
  pubSub.destroy()
  await Promise.all([pubSub.publisher.quit(), pubSub.subscriber.quit(), getRedis().quit()])
  await pg.destroy()
})

const leaveTeam = async (userId: string, nextLeadId: string) => {
  await pg
    .updateTable('TeamMember')
    .set({isNotRemoved: false, isLead: false})
    .where('teamId', '=', teamId)
    .where('userId', '=', userId)
    .execute()
  await pg
    .updateTable('TeamMember')
    .set({isLead: true})
    .where('teamId', '=', teamId)
    .where('userId', '=', nextLeadId)
    .execute()
  await removeMeetingTOCAccess(teamId, userId, nextLeadId)
}

let tocPageId: number
let summaryPageId: number

const createSummary = async () => {
  const summary = await createNewPage({
    parentPageId: tocPageId,
    userId: enderId,
    summaryMeetingId: meetingId,
    content: {type: 'doc', content: [{type: 'heading', attrs: {level: 1}, content: []}]}
  })
  return summary.id
}

test('the team lead owns the Meeting Summaries page, not whoever ended the first meeting', async () => {
  const dataLoader = getNewDataLoader('ensureMeetingTOCPage.test')
  tocPageId = await ensureMeetingTOCPage(enderId, teamId, dataLoader)
  dataLoader.dispose()

  const tocPage = await pg
    .selectFrom('Page')
    .select('isMeetingTOC')
    .where('id', '=', tocPageId)
    .executeTakeFirstOrThrow()
  expect(tocPage.isMeetingTOC).toBe(true)
  expect(await getRoles(tocPageId)).toEqual({
    [leadId]: 'owner',
    [enderId]: 'editor',
    [memberId]: 'editor'
  })
}, 30_000)

test('a summary inherits the summaries page access and is also owned by whoever ended the meeting', async () => {
  summaryPageId = await createSummary()
  expect(await getRoles(summaryPageId)).toEqual({
    [leadId]: 'owner',
    [enderId]: 'owner',
    [memberId]: 'editor'
  })
}, 30_000)

test('leaving the team removes direct access to the summaries page and hands its ownership to the new lead', async () => {
  await leaveTeam(leadId, memberId)
  expect(await getRoles(tocPageId)).toEqual({[memberId]: 'owner', [enderId]: 'editor'})
  expect(await getRoles(summaryPageId)).toEqual({
    [leadId]: 'owner',
    [enderId]: 'owner',
    [memberId]: 'editor'
  })
}, 30_000)

test('summaries made after someone leaves do not inherit their access', async () => {
  const laterSummaryPageId = await createSummary()
  expect(await getRoles(laterSummaryPageId)).toEqual({[memberId]: 'owner', [enderId]: 'owner'})
}, 30_000)
