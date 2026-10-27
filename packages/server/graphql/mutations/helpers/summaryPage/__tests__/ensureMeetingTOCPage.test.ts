import {getNewDataLoader} from '../../../../../dataloader/getNewDataLoader'
import generateUID from '../../../../../generateUID'
import getKysely from '../../../../../postgres/getKysely'
import getPubSub from '../../../../../utils/getPubSub'
import getRedis from '../../../../../utils/getRedis'
import {createNewPage} from '../../../../../utils/tiptap/createNewPage'
import {ensureMeetingTOCPage} from '../ensureMeetingTOCPage'
import {transferMeetingTOCOwnership} from '../transferMeetingTOCOwnership'

jest.mock('../../../../../utils/publishPageNotification', () => ({
  publishPageNotification: async () => {}
}))
jest.mock('../../../../../utils/analytics/analytics', () => ({
  analytics: {pageCreated: () => {}}
}))

const pg = getKysely()
const orgId = `tocOrg|${generateUID()}`
const teamId = `tocTeam|${generateUID()}`
const firstEnderId = `tocFirstEnder|${generateUID()}`
const laterEnderId = `tocLaterEnder|${generateUID()}`
const userIds = [firstEnderId, laterEnderId]
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
    .values(userIds.map((userId) => ({id: `${teamId}::${userId}`, teamId, userId})))
    .execute()
  await pg
    .insertInto('NewMeeting')
    .values({
      id: meetingId,
      teamId,
      facilitatorStageId: 'stage1',
      facilitatorUserId: laterEnderId,
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

test('the Meeting Summaries page has one owner and each summary is owned by whoever ended the meeting', async () => {
  const dataLoader = getNewDataLoader('ensureMeetingTOCPage.test')
  const tocPageId = await ensureMeetingTOCPage(firstEnderId, teamId, dataLoader)
  dataLoader.dispose()

  const tocPage = await pg
    .selectFrom('Page')
    .select('isMeetingTOC')
    .where('id', '=', tocPageId)
    .executeTakeFirstOrThrow()
  expect(tocPage.isMeetingTOC).toBe(true)
  expect(await getRoles(tocPageId)).toEqual({[firstEnderId]: 'owner', [laterEnderId]: 'editor'})

  const summary = await createNewPage({
    parentPageId: tocPageId,
    userId: laterEnderId,
    summaryMeetingId: meetingId,
    content: {type: 'doc', content: [{type: 'heading', attrs: {level: 1}, content: []}]}
  })
  expect(await getRoles(summary.id)).toEqual({[firstEnderId]: 'editor', [laterEnderId]: 'owner'})

  await transferMeetingTOCOwnership(teamId, firstEnderId, laterEnderId)
  expect(await getRoles(tocPageId)).toEqual({[firstEnderId]: 'editor', [laterEnderId]: 'owner'})
}, 30_000)
