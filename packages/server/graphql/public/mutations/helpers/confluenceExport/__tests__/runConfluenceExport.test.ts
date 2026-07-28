import {TiptapTransformer} from '@hocuspocus/transformer'
import {serverTipTapExtensions} from 'parabol-client/shared/tiptap/serverTipTapExtensions'
import type {TipTapSerializedPageContent} from 'parabol-client/shared/tiptap/TipTapSerializedContent'
import {encodeStateAsUpdate} from 'yjs'
import {getNewDataLoader} from '../../../../../../dataloader/getNewDataLoader'
import generateUID from '../../../../../../generateUID'
import getKysely from '../../../../../../postgres/getKysely'
import {selectPageExports} from '../../../../../../postgres/select'
import type {PageExportPageState} from '../../../../../../utils/confluence/types'
import {runConfluenceExport} from '../runConfluenceExport'

const mockConfluence = {
  created: [] as {id: string; title: string; parentId?: string}[],
  uploaded: [] as {pageId: string; filename: string}[],
  failByTitle: new Map<string, Error>()
}

jest.mock('../../../../../../utils/ConfluenceServerManager', () => {
  const actual = jest.requireActual('../../../../../../utils/ConfluenceServerManager')
  class MockConfluenceServerManager {
    async createPageWithUniqueTitle(input: {title: string; parentId?: string}) {
      const err = mockConfluence.failByTitle.get(input.title)
      if (err) throw err
      const id = `c${mockConfluence.created.length + 1}`
      mockConfluence.created.push({id, title: input.title, parentId: input.parentId})
      return {
        page: {id, title: input.title, version: 1, webui: `/spaces/T/pages/${id}/x`},
        finalTitle: input.title
      }
    }
    async uploadAttachment(pageId: string, filename: string) {
      mockConfluence.uploaded.push({pageId, filename})
    }
  }
  return {...actual, ConfluenceServerManager: MockConfluenceServerManager}
})

jest.mock('../../../../../../utils/AtlassianServerManager', () => {
  class MockAtlassianServerManager {
    async getAccessibleResources() {
      return [{id: 'cloud-test', name: 'test', url: 'https://test.atlassian.net', scopes: []}]
    }
  }
  return {__esModule: true, default: MockAtlassianServerManager}
})

const pg = getKysely()
const uid = generateUID()
const userId = `confluenceJob|${uid}`
const orgId = `confluenceJobOrg|${uid}`
const teamId = `confluenceJobTeam|${uid}`
const CONF_SCOPE =
  'read:jira-user read:jira-work write:jira-work offline_access read:page:confluence write:page:confluence read:space:confluence write:attachment:confluence read:content-details:confluence'

const b64 = (obj: object) => Buffer.from(JSON.stringify(obj)).toString('base64url')
const fakeJwt = () =>
  `${b64({alg: 'none', typ: 'JWT'})}.${b64({exp: Math.floor(Date.now() / 1000) + 3600})}.sig`

const pageDoc = (title: string) =>
  ({
    type: 'doc',
    content: [
      {type: 'heading', attrs: {level: 1}, content: [{type: 'text', text: title}]},
      {type: 'paragraph', content: [{type: 'text', text: `${title} body`}]}
    ]
  }) as unknown as TipTapSerializedPageContent

const insertPage = async (title: string, parentPageId: number | null) => {
  const yDoc = Buffer.from(
    encodeStateAsUpdate(TiptapTransformer.toYdoc(pageDoc(title), undefined, serverTipTapExtensions))
  )
  const page = await pg
    .insertInto('Page')
    .values({userId, isPrivate: true, sortOrder: '', title, parentPageId, yDoc})
    .returning('id')
    .executeTakeFirstOrThrow()
  return page.id
}

beforeAll(async () => {
  await pg
    .insertInto('User')
    .values({
      id: userId,
      email: `${userId}@example.com`,
      picture: 'https://example.com/pic.png',
      preferredName: 'Job Tester'
    })
    .execute()
  await pg.insertInto('Organization').values({id: orgId, name: 'Job Test Org'}).execute()
  await pg.insertInto('Team').values({id: teamId, name: 'Job Test Team', orgId}).execute()
  await pg
    .insertInto('AtlassianAuth')
    .values({
      userId,
      teamId,
      accountId: 'acct1',
      accessToken: fakeJwt(),
      refreshToken: 'refresh',
      cloudIds: ['cloud-test'],
      scope: CONF_SCOPE
    })
    .execute()
})

afterAll(async () => {
  await pg.deleteFrom('Notification').where('userId', '=', userId).execute()
  await pg.deleteFrom('Page').where('userId', '=', userId).execute()
  await pg.deleteFrom('User').where('id', '=', userId).execute()
  await pg.deleteFrom('Team').where('id', '=', teamId).execute()
  await pg.deleteFrom('Organization').where('id', '=', orgId).execute()
})

describe('runConfluenceExport', () => {
  it('scenario C: contains a failed page, skips its subtree, finishes partial, notifies', async () => {
    const rootId = await insertPage('Root', null)
    const childIds: number[] = []
    for (let i = 1; i <= 10; i++) {
      childIds.push(await insertPage(`Child ${i}`, rootId))
    }
    const grandchildId = await insertPage('Grandchild', childIds[6]!) // under Child 7
    const entries: PageExportPageState[] = [
      {pageId: rootId, title: 'Root', depth: 0, parentPageId: null, status: 'pending'},
      ...childIds.map((pageId, i) => ({
        pageId,
        title: `Child ${i + 1}`,
        depth: 1,
        parentPageId: rootId,
        status: 'pending' as const
      })),
      {
        pageId: grandchildId,
        title: 'Grandchild',
        depth: 2,
        parentPageId: childIds[6]!,
        status: 'pending'
      }
    ]
    const {id: exportId} = await pg
      .insertInto('PageExport')
      .values({
        pageId: rootId,
        userId,
        cloudId: 'cloud-test',
        spaceId: 's1',
        spaceName: 'Test Space',
        includeSubPages: true,
        pagesJson: JSON.stringify(entries)
      })
      .returning('id')
      .executeTakeFirstOrThrow()

    const {ConfluenceApiError} = jest.requireActual(
      '../../../../../../utils/ConfluenceServerManager'
    )
    mockConfluence.failByTitle.set('Child 7', new ConfluenceApiError(413, 'too big', 'tooLarge'))

    const dataLoader = getNewDataLoader('test')
    await runConfluenceExport(exportId, dataLoader)
    dataLoader.dispose()

    const row = await selectPageExports().where('id', '=', exportId).executeTakeFirstOrThrow()
    expect(row.status).toBe('partial')
    const byTitle = Object.fromEntries(row.pagesJson.map((p) => [p.title, p]))
    expect(byTitle['Child 7']!.status).toBe('error')
    expect(byTitle['Child 7']!.error).toBe(
      'Too large for Confluence (5 MB limit). Try splitting this page.'
    )
    expect(byTitle['Grandchild']!.status).toBe('skipped')
    expect(byTitle['Grandchild']!.error).toBe('skipped (parent failed)')
    const successCount = row.pagesJson.filter((p) => p.status === 'success').length
    expect(successCount).toBe(entries.length - 2)
    expect(row.rootTargetUrl).toBe(
      `https://test.atlassian.net/wiki${mockConfluence.created[0]!.id ? `/spaces/T/pages/${mockConfluence.created[0]!.id}/x` : ''}`
    )

    // children were created under the root's confluence page
    const rootConfluenceId = mockConfluence.created.find(({title}) => title === 'Root')!.id
    const child1 = mockConfluence.created.find(({title}) => title === 'Child 1')!
    expect(child1.parentId).toBe(rootConfluenceId)

    const notification = await pg
      .selectFrom('Notification')
      .selectAll()
      .where('userId', '=', userId)
      .where('type', '=', 'PAGE_EXPORT_COMPLETE')
      .executeTakeFirst()
    expect(notification).toBeTruthy()
    expect(String(notification!.pageExportId)).toBe(exportId)

    // retry: re-seed the failed page + skipped descendants, fix the failure, rerun
    mockConfluence.failByTitle.clear()
    const retryPages = row.pagesJson.map((p) =>
      p.status === 'error' || p.status === 'skipped'
        ? {...p, status: 'pending' as const, error: undefined, errorClass: undefined}
        : p
    )
    await pg
      .updateTable('PageExport')
      .set({status: 'running', pagesJson: JSON.stringify(retryPages)})
      .where('id', '=', exportId)
      .execute()

    const retryLoader = getNewDataLoader('test')
    await runConfluenceExport(exportId, retryLoader)
    retryLoader.dispose()

    const retried = await selectPageExports().where('id', '=', exportId).executeTakeFirstOrThrow()
    expect(retried.status).toBe('success')
    expect(retried.pagesJson.every((p) => p.status === 'success')).toBe(true)
    // the retried child was created under the ORIGINAL run's parent confluence page
    const child7 = mockConfluence.created.find(({title}) => title === 'Child 7')!
    expect(child7.parentId).toBe(rootConfluenceId)

    const notifications = await pg
      .selectFrom('Notification')
      .selectAll()
      .where('userId', '=', userId)
      .where('type', '=', 'PAGE_EXPORT_COMPLETE')
      .execute()
    expect(notifications).toHaveLength(2)
  }, 120_000)
})
