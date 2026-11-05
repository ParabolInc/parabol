import * as Y from 'yjs'
import {rehostExternalAssets} from '../rehostExternalAssets'

const mockPageRoles = new Map<string, string>()
const mockPublicRoles = new Map<number, string>()
const mockCharges: [userId: string, bytes: number][] = []
const mockFetchedUrls: string[] = []
const mockAccessCheckUserIds: string[] = []
const mockErrors: unknown[] = []
const mockDocs: {current?: Y.Doc} = {}
const mockFetchGate: {wait?: Promise<void>} = {}

jest.mock('../../../appOrigin', () => ({__esModule: true, default: 'https://parabol.test'}))
jest.mock('../../CipherId', () => ({
  CipherId: {
    encrypt: (id: number) => id,
    decrypt: (code: number) => code,
    toClient: (id: number, entity: string) => `${entity}:${id}`,
    fromClient: (key: string) => {
      const [entity, code] = key.split(':')
      return [Number(code), Number(code), entity]
    }
  }
}))
jest.mock('../../../dataloader/getNewDataLoader', () => ({
  getNewDataLoader: () => ({
    get: (name: string) => ({
      load: async (key: {pageId: number; userId: string} | string) => {
        if (name === 'teamIdsByUserId') return []
        if (name === 'highestTierForUserId') return 'team'
        if (name === 'pageAccessByPageIdUserId' && typeof key === 'object') {
          const {pageAccessByUserIdBatchFn} = jest.requireActual(
            '../../../dataloader/pageAccessByUserIdBatchFn'
          )
          const [role] = await pageAccessByUserIdBatchFn([key])
          return role
        }
        throw new Error(`Unexpected dataloader ${name}`)
      }
    }),
    dispose: () => {}
  })
}))
jest.mock('../../../postgres/select', () => ({
  selectPageAccess: () => {
    const builder = {
      where: () => builder,
      unionAll: () => builder,
      execute: async () => [
        ...[...mockPageRoles].map(([pageAndUser, role]) => {
          const [pageId, userId] = pageAndUser.split(':')
          return {pageId: Number(pageId), userId, role}
        }),
        ...[...mockPublicRoles].map(([pageId, role]) => ({pageId, userId: '*', role}))
      ]
    }
    return builder
  }
}))
jest.mock('../../getUserDetail', () => ({__esModule: true, default: async () => '0'}))
jest.mock('../../../postgres/getKysely', () => ({
  __esModule: true,
  default: () => ({
    insertInto: () => ({
      values: ({id, bytesUploaded}: {id: string; bytesUploaded: number}) => ({
        onConflict: () => ({
          execute: async () => {
            mockCharges.push([id, bytesUploaded])
          }
        })
      })
    })
  })
}))
jest.mock('../../fetchUntrusted', () => ({
  fetchUntrusted: async (url: string) => {
    mockFetchedUrls.push(url)
    await mockFetchGate.wait
    return {contentType: 'image/png', buffer: Buffer.from('image')}
  }
}))
jest.mock('../../compressImage', () => ({
  compressImage: async (buffer: Buffer, extension: string) => ({buffer, extension})
}))
jest.mock('../../../fileStorage/getFileStoreManager', () => ({
  __esModule: true,
  default: () => ({
    putUserFile: async (_file: Buffer, partialPath: string) =>
      `https://parabol.test/assets/${partialPath}`,
    copyFile: async (_from: string, to: string) => `https://parabol.test/assets/${to}`
  })
}))
jest.mock('../../../assetProxyHandler', () => ({
  checkAccess: async (authToken: {sub: string}, _scope: string, scopeCode: string) => {
    mockAccessCheckUserIds.push(authToken.sub)
    return mockPageRoles.has(`${scopeCode}:${authToken.sub}`)
  }
}))
jest.mock('@whatwg-node/fetch', () => ({
  fetch: async () => ({headers: new Headers({'content-length': '7', 'content-type': 'image/png'})})
}))
jest.mock('../../encodeAuthToken', () => ({__esModule: true, default: () => 'token'}))
jest.mock('../../logError', () => ({
  __esModule: true,
  default: (error: unknown) => mockErrors.push(error)
}))
jest.mock('../../../hocusPocus', () => ({
  hocuspocus: {
    openDirectConnection: async () => ({
      transact: async (fn: (doc: Y.Doc) => void) => {
        const doc = mockDocs.current!
        doc.transact(() => fn(doc), {source: 'local', context: {}})
      },
      disconnect: async () => {}
    })
  }
}))
jest.mock('../hocusPocusHub', () => ({
  replacePageAssetSrc: (pageId: number, src: string, hostedSrc: string) =>
    jest.requireActual('../hocusPocusCustomEvents').replaceAssetSrc(`page:${pageId}`, {
      src,
      hostedSrc
    })
}))

const PAGE_ID = 10
const SECRET_PAGE_ID = 20
const INSERTER_ID = 'user-inserter'
const READER_ID = 'user-reader'
const EXTERNAL_SRC = 'https://tracker.example/pixel.png'
const HOSTED_SRC = /^https:\/\/parabol\.test\/assets\/Page\/10\/assets\/.+\.png$/

const flush = async () => {
  for (let i = 0; i < 20; i++) await new Promise((resolve) => setImmediate(resolve))
}

const asConnection = (userId?: string) => {
  const sendStateless = jest.fn()
  return {
    origin: {source: 'connection', connection: {context: {userId}, sendStateless}},
    sendStateless
  }
}

const makePage = () => {
  const doc = new Y.Doc()
  mockDocs.current = doc
  const frag = doc.getXmlFragment('default')
  frag.observeDeep((events) => events.forEach((e) => rehostExternalAssets(e, PAGE_ID)))
  return {doc, frag}
}

const makeImage = (src: string) => {
  const image = new Y.XmlElement('imageBlock')
  image.setAttribute('src', src)
  return image
}

const getSrcs = (frag: Y.XmlFragment) =>
  frag.toArray().map((node) => (node as Y.XmlElement).getAttribute('src'))

beforeEach(() => {
  mockPageRoles.clear()
  mockPublicRoles.clear()
  mockCharges.length = 0
  mockFetchedUrls.length = 0
  mockAccessCheckUserIds.length = 0
  mockErrors.length = 0
  mockFetchGate.wait = undefined
  mockPageRoles.set(`${PAGE_ID}:${INSERTER_ID}`, 'editor')
  mockPageRoles.set(`${PAGE_ID}:${READER_ID}`, 'editor')
})

afterEach(() => {
  expect(mockErrors).toEqual([])
})

test('hosts an external image on the quota of the editor who added it', async () => {
  const {doc, frag} = makePage()
  doc.transact(() => frag.insert(0, [makeImage(EXTERNAL_SRC)]), asConnection(INSERTER_ID).origin)
  await flush()
  expect(mockFetchedUrls).toEqual([EXTERNAL_SRC])
  expect(mockCharges).toEqual([[INSERTER_ID, 5]])
  expect(getSrcs(frag)).toEqual([expect.stringMatching(HOSTED_SRC)])
})

test('hosts an image nested in a block, and a src changed to an external URL', async () => {
  const {doc, frag} = makePage()
  const listItem = new Y.XmlElement('listItem')
  listItem.insert(0, [makeImage(EXTERNAL_SRC)])
  doc.transact(() => frag.insert(0, [listItem]), asConnection(INSERTER_ID).origin)
  await flush()
  expect(mockFetchedUrls).toEqual([EXTERNAL_SRC])

  const image = makeImage('https://parabol.test/assets/Page/10/assets/uploaded.png')
  doc.transact(() => frag.insert(1, [image]))
  const changedSrc = 'https://tracker.example/other.png'
  doc.transact(() => image.setAttribute('src', changedSrc), asConnection(INSERTER_ID).origin)
  await flush()
  expect(mockFetchedUrls).toEqual([EXTERNAL_SRC, changedSrc])
  expect(image.getAttribute('src')).toMatch(HOSTED_SRC)
})

test("never fetches an anonymous editor's URL, and hosts it as a signed-in editor who adds it again", async () => {
  const {doc, frag} = makePage()
  const anonymous = asConnection(undefined)
  doc.transact(() => frag.insert(0, [makeImage(EXTERNAL_SRC)]), anonymous.origin)
  await flush()
  expect(mockFetchedUrls).toEqual([])
  expect(mockCharges).toEqual([])
  expect(getSrcs(frag)).toEqual([EXTERNAL_SRC])
  expect(anonymous.sendStateless).not.toHaveBeenCalled()

  doc.transact(() => frag.insert(1, [makeImage(EXTERNAL_SRC)]), asConnection(INSERTER_ID).origin)
  await flush()
  expect(mockCharges).toEqual([[INSERTER_ID, 5]])
  expect(getSrcs(frag)).toEqual([
    expect.stringMatching(HOSTED_SRC),
    expect.stringMatching(HOSTED_SRC)
  ])
})

test('does not fetch a planted URL as another user who edits or moves its block', async () => {
  const {doc, frag} = makePage()
  doc.transact(() => frag.insert(0, [makeImage(EXTERNAL_SRC)]), asConnection(undefined).origin)
  const planted = frag.get(0) as Y.XmlElement
  const reader = asConnection(READER_ID)
  doc.transact(() => planted.setAttribute('align', 'left'), reader.origin)
  doc.transact(() => {
    frag.insert(0, [new Y.XmlElement('paragraph')])
    frag.delete(1, 1)
    frag.insert(1, [makeImage(EXTERNAL_SRC)])
  }, reader.origin)
  await flush()
  expect(mockFetchedUrls).toEqual([])
  expect(mockCharges).toEqual([])
  expect(reader.sendStateless).not.toHaveBeenCalled()
})

test('hosts as a signed-in user who edits only through the public editor link', async () => {
  mockPageRoles.delete(`${PAGE_ID}:${INSERTER_ID}`)
  mockPublicRoles.set(PAGE_ID, 'editor')
  const {doc, frag} = makePage()
  const inserter = asConnection(INSERTER_ID)
  doc.transact(() => frag.insert(0, [makeImage(EXTERNAL_SRC)]), inserter.origin)
  await flush()
  expect(mockCharges).toEqual([[INSERTER_ID, 5]])
  expect(getSrcs(frag)).toEqual([expect.stringMatching(HOSTED_SRC)])
  expect(inserter.sendStateless).not.toHaveBeenCalled()
})

test('does not fetch for a user who may not upload to the page', async () => {
  mockPageRoles.set(`${PAGE_ID}:${INSERTER_ID}`, 'viewer')
  const {doc, frag} = makePage()
  const inserter = asConnection(INSERTER_ID)
  doc.transact(() => frag.insert(0, [makeImage(EXTERNAL_SRC)]), inserter.origin)
  await flush()
  expect(mockFetchedUrls).toEqual([])
  expect(mockCharges).toEqual([])
  expect(inserter.sendStateless).toHaveBeenCalledTimes(1)
})

test("copies another page's asset only with the access of the user who added it", async () => {
  const secretSrc = `https://parabol.test/assets/Page/${SECRET_PAGE_ID}/assets/secret.png`
  const {doc, frag} = makePage()
  const inserter = asConnection(INSERTER_ID)
  doc.transact(() => frag.insert(0, [makeImage(secretSrc)]), inserter.origin)
  await flush()
  expect(mockAccessCheckUserIds).toEqual([INSERTER_ID])
  expect(getSrcs(frag)).toEqual([secretSrc])
  expect(inserter.sendStateless).toHaveBeenCalledTimes(1)

  mockPageRoles.set(`${SECRET_PAGE_ID}:${INSERTER_ID}`, 'viewer')
  doc.transact(() => frag.insert(1, [makeImage(secretSrc)]), asConnection(INSERTER_ID).origin)
  await flush()
  expect(mockAccessCheckUserIds).toEqual([INSERTER_ID, INSERTER_ID])
  expect(mockCharges).toEqual([[INSERTER_ID, 7]])
  expect(getSrcs(frag)).toEqual([
    'https://parabol.test/assets/Page/10/assets/secret.png',
    'https://parabol.test/assets/Page/10/assets/secret.png'
  ])
})

test('keeps a src that changed while its old one was being fetched', async () => {
  let release = () => {}
  mockFetchGate.wait = new Promise((resolve) => {
    release = resolve
  })
  const {doc, frag} = makePage()
  const image = makeImage(EXTERNAL_SRC)
  doc.transact(() => frag.insert(0, [image]), asConnection(INSERTER_ID).origin)
  await flush()
  const uploadedSrc = 'https://parabol.test/assets/Page/10/assets/uploaded.png'
  doc.transact(() => image.setAttribute('src', uploadedSrc), asConnection(INSERTER_ID).origin)
  release()
  await flush()
  expect(image.getAttribute('src')).toBe(uploadedSrc)
})

test('skips assets already hosted in the page and server writes with no user', async () => {
  const {doc, frag} = makePage()
  doc.transact(
    () => frag.insert(0, [makeImage('/assets/Page/10/assets/uploaded.png')]),
    asConnection(INSERTER_ID).origin
  )
  doc.transact(() => frag.insert(1, [makeImage(EXTERNAL_SRC)]), {source: 'local', context: {}})
  await flush()
  expect(mockFetchedUrls).toEqual([])

  doc.transact(() => frag.insert(2, [makeImage(EXTERNAL_SRC)]), {
    source: 'local',
    context: {userId: INSERTER_ID}
  })
  await flush()
  expect(mockCharges).toEqual([[INSERTER_ID, 5]])
})
