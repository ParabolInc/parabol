import {TiptapTransformer} from '@hocuspocus/transformer'
import type {JSONContent} from '@tiptap/core'
import {serverTipTapExtensions} from 'parabol-client/shared/tiptap/serverTipTapExtensions'
import * as Y from 'yjs'
import appOrigin from '../../../appOrigin'
import {copyPageDoc} from '../copyPageDoc'
import {getPageScopedAssetSrcs} from '../getPageScopedAssetSrcs'

const heading = (text: string): JSONContent => ({
  type: 'heading',
  attrs: {level: 1},
  content: [{type: 'text', text}]
})
const pageLink = (attrs: Record<string, unknown>): JSONContent => ({type: 'pageLinkBlock', attrs})
const image = (src: string): JSONContent => ({type: 'imageBlock', attrs: {src}})

const toState = (doc: Y.Doc) => Y.encodeStateAsUpdate(doc)

const makeDoc = (content: JSONContent[]) =>
  toState(TiptapTransformer.toYdoc({type: 'doc', content}, 'default', serverTipTapExtensions))

const makeDocWithMap = (mapName: string, entries: Record<string, string>) => {
  const doc = TiptapTransformer.toYdoc(
    {type: 'doc', content: [heading('Plan')]},
    'default',
    serverTipTapExtensions
  )
  const map = doc.getMap<string>(mapName)
  for (const [key, value] of Object.entries(entries)) map.set(key, value)
  return toState(doc)
}

const readContent = (state: Uint8Array): JSONContent[] => {
  const doc = new Y.Doc()
  Y.applyUpdate(doc, state)
  return TiptapTransformer.fromYdoc(doc, 'default').content ?? []
}

const readLinks = (state: Uint8Array) =>
  readContent(state)
    .filter((node) => node.type === 'pageLinkBlock')
    .map(({attrs}) => {
      const {pageCode, canonical, synced} = attrs ?? {}
      return {pageCode, canonical, ...(synced ? {synced} : {})}
    })

const readImageSrcs = (state: Uint8Array) =>
  readContent(state)
    .filter((node) => node.type === 'imageBlock')
    .map((node) => node.attrs?.src)

const readHeading = (state: Uint8Array) =>
  readContent(state).find((node) => node.type === 'heading')?.content?.[0]?.text

const readMap = (state: Uint8Array, mapName: string) => {
  const doc = new Y.Doc()
  Y.applyUpdate(doc, state)
  return doc.getMap<string>(mapName).toJSON()
}

describe('copyPageDoc', () => {
  test('maps canonical child links to their copies', () => {
    const source = makeDoc([heading('Plan'), pageLink({pageCode: 11, canonical: true})])
    const out = readLinks(
      copyPageDoc(source, {childCodes: new Map([[11, 99]]), assetSrcs: new Map()})
    )
    expect(out).toEqual([{pageCode: 99, canonical: true}])
  })
  test('turns unmapped canonical links into references', () => {
    const source = makeDoc([
      heading('Plan'),
      pageLink({pageCode: 12, canonical: true, synced: true})
    ])
    expect(readLinks(copyPageDoc(source, {childCodes: new Map(), assetSrcs: new Map()}))).toEqual([
      {pageCode: 12, canonical: false, synced: true}
    ])
  })
  test('leaves reference links alone', () => {
    const source = makeDoc([heading('Plan'), pageLink({pageCode: 13, canonical: false})])
    expect(
      readLinks(copyPageDoc(source, {childCodes: new Map([[13, 77]]), assetSrcs: new Map()}))
    ).toEqual([{pageCode: 13, canonical: false}])
  })
  test('rewrites page-scoped asset srcs', () => {
    const src = `${appOrigin}/assets/Page/11/assets/a.png`
    const hosted = `${appOrigin}/assets/Page/99/assets/a.png`
    const source = makeDoc([heading('Plan'), image(src)])
    expect(
      readImageSrcs(
        copyPageDoc(source, {childCodes: new Map(), assetSrcs: new Map([[src, hosted]])})
      )
    ).toEqual([hosted])
  })
  test('renames the root heading', () => {
    const source = makeDoc([heading('Plan')])
    expect(
      readHeading(
        copyPageDoc(source, {
          childCodes: new Map(),
          assetSrcs: new Map(),
          rootTitle: 'Copy of Plan'
        })
      )
    ).toBe('Copy of Plan')
  })
  test('keeps database data outside the default fragment', () => {
    const source = makeDocWithMap('columnMeta', {c1: 'Alpha'})
    expect(
      readMap(copyPageDoc(source, {childCodes: new Map(), assetSrcs: new Map()}), 'columnMeta')
    ).toEqual({c1: 'Alpha'})
  })
  test('getPageScopedAssetSrcs only returns this page’s uploads', () => {
    const mine = `${appOrigin}/assets/Page/11/assets/a.png`
    const team = `${appOrigin}/assets/Team/t1/assets/b.png`
    expect(getPageScopedAssetSrcs(makeDoc([image(mine), image(team)]), 11)).toEqual([mine])
  })
  test('copies a link card’s hosted thumbnail', () => {
    const thumbnail = `${appOrigin}/assets/Page/11/assets/card.png`
    const hosted = `${appOrigin}/assets/Page/99/assets/card.png`
    const card: JSONContent = {
      type: 'embedBlock',
      attrs: {url: 'https://example.com', thumbnailUrl: thumbnail}
    }
    const source = makeDoc([heading('Plan'), card])
    expect(getPageScopedAssetSrcs(source, 11)).toEqual([thumbnail])
    const copied = readContent(
      copyPageDoc(source, {childCodes: new Map(), assetSrcs: new Map([[thumbnail, hosted]])})
    ).find((node) => node.type === 'embedBlock')
    expect(copied?.attrs?.thumbnailUrl).toBe(hosted)
  })
})
