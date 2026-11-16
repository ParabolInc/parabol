import {getTestEmail} from '../../../__tests__/common'
import generateUID from '../../../generateUID'
import {redisHocusPocus} from '../../../hocusPocus'
import getKysely from '../../../postgres/getKysely'
import {CipherId} from '../../CipherId'
import {updateAllBacklinkedPageLinkTitles} from '../hocusPocusHub'

jest.mock('../../../hocusPocus', () => ({
  redisHocusPocus: {handleEvent: jest.fn(async () => {})}
}))
const handleEvent = jest.mocked(redisHocusPocus.handleEvent)

jest.setTimeout(30000)

const pg = getKysely()

afterAll(async () => {
  await pg.destroy()
})

const seedPageWithHost = async (isSyncedBlock: boolean) => {
  const {id: userId} = await pg
    .insertInto('User')
    .values({
      id: generateUID(),
      email: getTestEmail(),
      picture: '',
      preferredName: 'Owner',
      inactive: false
    })
    .returning('id')
    .executeTakeFirstOrThrow()
  const insertPage = (flag: boolean) =>
    pg
      .insertInto('Page')
      .values({userId, sortOrder: '', ancestorIds: [], isSyncedBlock: flag})
      .returning('id')
      .executeTakeFirstOrThrow()
  const [page, host] = [await insertPage(isSyncedBlock), await insertPage(false)]
  await pg.insertInto('PageBacklink').values({fromPageId: host.id, toPageId: page.id}).execute()
  return {pageId: page.id, host: host.id}
}

beforeEach(() => {
  handleEvent.mockClear()
})

test('sends nothing to the hosts of a synced block', async () => {
  const {pageId} = await seedPageWithHost(true)
  await updateAllBacklinkedPageLinkTitles({pageId, title: 'Escalation'})
  expect(handleEvent).not.toHaveBeenCalled()
})

test('sends the title to the hosts of an ordinary page', async () => {
  const {pageId, host} = await seedPageWithHost(false)
  await updateAllBacklinkedPageLinkTitles({pageId, title: 'Runbook'})
  expect(handleEvent).toHaveBeenCalledWith(
    'updateBacklinkedPageLinkTitles',
    CipherId.toClient(host, 'page'),
    {pageCode: CipherId.encrypt(pageId), title: 'Runbook'}
  )
})
