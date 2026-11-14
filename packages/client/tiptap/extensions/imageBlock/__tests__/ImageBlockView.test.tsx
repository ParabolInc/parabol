import {getSchema} from '@tiptap/core'
import {EditorState} from '@tiptap/pm/state'
import type {NodeViewProps} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {ySyncPluginKey} from '@tiptap/y-tiptap'
import {renderToStaticMarkup} from 'react-dom/server'
import {clearEmbedEntries, handleServerEmbedMessage} from '../../fileBlock/embedManager'
import {localEmbedSourcesPlugin} from '../../fileBlock/localEmbedSources'
import {ImageBlock} from '../ImageBlock'
import {ImageBlockBase} from '../ImageBlockBase'
import {ImageBlockView} from '../ImageBlockView'

const mockAtmosphere: {authObj: object | null} = {authObj: {sub: 'user-inserter'}}
jest.mock('../../../../hooks/useAtmosphere', () => ({
  __esModule: true,
  default: () => mockAtmosphere
}))
jest.mock('../../../../hooks/useSignInAndReturn', () => ({useSignInAndReturn: () => () => {}}))

const PAGE_ASSET_SRC = 'https://parabol.test/assets/Page/10/assets/hosted.png'
const schema = getSchema([StarterKit, ImageBlockBase])

beforeAll(() => {
  Object.assign(globalThis, {
    window: {
      location: {origin: 'https://parabol.test', host: 'parabol.test'},
      __ACTION__: {publicPath: 'https://cdn.parabol.test/production/build/'}
    }
  })
})

beforeEach(() => {
  clearEmbedEntries()
  mockAtmosphere.authObj = {sub: 'user-inserter'}
})

let srcCount = 0
const makeExternalSrc = () => `https://tracker.example/pixel-${++srcCount}.png`

const addImage = (state: EditorState, src: string, isRemote: boolean) => {
  const tr = state.tr.insert(state.doc.content.size, schema.nodes.imageBlock!.create({src}))
  if (isRemote) tr.setMeta(ySyncPluginKey, {isChangeOrigin: true})
  return state.apply(tr)
}

const makeDocWithImage = (src: string, isRemote: boolean) =>
  addImage(EditorState.create({schema, plugins: [localEmbedSourcesPlugin]}), src, isRemote)

const renderImage = (src: string) => {
  const editor = {
    isEditable: false,
    extensionStorage: {fileUpload: {scopeKey: 'page:10', assetScope: 'Page'}},
    storage: {imageBlock: {editorWidth: 720, editorHeight: 400}},
    view: {dom: {getBoundingClientRect: () => ({width: 720})}}
  }
  const props = {
    editor,
    node: {attrs: {src, align: 'center', isFullWidth: false}},
    getPos: () => 1,
    updateAttributes: () => {},
    selected: false
  } as unknown as NodeViewProps
  return renderToStaticMarkup(<ImageBlockView {...props} />)
}

test('shows a placeholder, not the image, for an external src someone else added', () => {
  const src = makeExternalSrc()
  makeDocWithImage(src, true)
  const html = renderImage(src)
  expect(html).not.toContain('<img')
  expect(html).toContain('External image')
  expect(html).toContain(`href="${src}"`)
})

test('shows the user who added an external image their copy while the server hosts it', () => {
  const src = makeExternalSrc()
  makeDocWithImage(src, false)
  const html = renderImage(src)
  expect(html).toContain(`<img draggable="false" data-uploading=""`)
  expect(html).toContain(`src="${src}"`)
})

test('asks an anonymous editor to sign in instead of showing an image only they could see', () => {
  mockAtmosphere.authObj = null
  const src = makeExternalSrc()
  makeDocWithImage(src, false)
  const html = renderImage(src)
  expect(html).not.toContain('<img')
  expect(html).toContain('Sign in to add images')
  expect(html).toContain('>Sign in</button>')
})

test('keeps an external image blocked after the user drags its block', () => {
  const src = makeExternalSrc()
  const state = makeDocWithImage(src, true)
  const imagePos = state.doc.content.size - 1
  const image = state.doc.nodeAt(imagePos)!
  const tr = state.tr.delete(imagePos, imagePos + image.nodeSize).insert(0, image)
  state.apply(tr)
  expect(renderImage(src)).not.toContain('<img')
})

test('shows the error to the user who added an image the server could not host', () => {
  const src = makeExternalSrc()
  makeDocWithImage(src, false)
  handleServerEmbedMessage({payload: JSON.stringify({type: 'assetNotHosted', src})})
  const html = renderImage(src)
  expect(html).not.toContain('<img')
  expect(html).toContain('Image couldn&#x27;t be embedded')
})

test('loads Parabol-hosted images for everyone', () => {
  makeDocWithImage(PAGE_ASSET_SRC, true)
  expect(renderImage(PAGE_ASSET_SRC)).toContain(`src="${PAGE_ASSET_SRC}"`)
  const otherScopeSrc = '/assets/Team/team1/assets/reflection.png'
  expect(renderImage(otherScopeSrc)).toContain(`src="${otherScopeSrc}"`)
  const plainHttpSrc = 'http://parabol.test/assets/Page/10/assets/hosted.png'
  expect(renderImage(plainHttpSrc)).toContain(`src="${plainHttpSrc}"`)
  const cdnSrc = 'https://cdn.parabol.test/production/store/Team/team1/assets/old.png'
  expect(renderImage(cdnSrc)).toContain(`src="${cdnSrc}"`)
})

test('blocks srcs that only look like Parabol assets', () => {
  const lookalikes = [
    'https://tracker.example/assets/Page/10/assets/hosted.png',
    '//tracker.example/assets/Page/10/assets/hosted.png',
    'https://cdn.parabol.test/production/storeX/pixel.png',
    'https://parabol.test/email/unsubscribe',
    'https://parabol.test:8443/assets/Page/10/assets/hosted.png'
  ]
  lookalikes.forEach((src) => {
    expect(renderImage(src)).not.toContain('<img')
  })
})

test('renders a blocked src inertly when the editor falls back to plain HTML', () => {
  const clientSchema = getSchema([StarterKit, ImageBlock])
  const toImgAttrs = (src: string) => {
    const node = clientSchema.nodes.imageBlock!.create({src})
    const [, , [, imgAttrs]] = clientSchema.nodes.imageBlock!.spec.toDOM!(node) as [
      string,
      unknown,
      [string, Record<string, string>]
    ]
    return imgAttrs
  }
  const src = makeExternalSrc()
  expect(toImgAttrs(src)).toMatchObject({'data-src': src})
  expect(toImgAttrs(src)).not.toHaveProperty('src')
  expect(toImgAttrs(PAGE_ASSET_SRC)).toMatchObject({src: PAGE_ASSET_SRC})
})
