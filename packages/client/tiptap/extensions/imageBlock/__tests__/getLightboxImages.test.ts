import {getSchema} from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import {clearEmbedEntries} from '../../fileBlock/embedManager'
import {getLightboxImages} from '../getLightboxImages'
import {ImageBlockBase} from '../ImageBlockBase'

const schema = getSchema([StarterKit, ImageBlockBase])
const hosted = (name: string) => `https://parabol.test/assets/Page/10/assets/${name}.png`

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
})

const makeDoc = (srcs: {src: string; alt?: string}[]) =>
  schema.nodes.doc!.create(
    null,
    srcs.map((attrs) => schema.nodes.imageBlock!.create(attrs))
  )

const positionsOf = (doc: ReturnType<typeof makeDoc>) => {
  const positions: number[] = []
  doc.descendants((node, pos) => {
    if (node.type.name === 'imageBlock') positions.push(pos)
  })
  return positions
}

test('steps through the hosted images in document order, starting at the one opened', () => {
  const doc = makeDoc([
    {src: hosted('a')},
    {src: hosted('b'), alt: 'Latency chart'},
    {src: hosted('c')}
  ])
  const {images, startIndex} = getLightboxImages(doc, positionsOf(doc)[1]!)
  expect(images).toEqual([
    {src: hosted('a'), alt: undefined},
    {src: hosted('b'), alt: 'Latency chart'},
    {src: hosted('c'), alt: undefined}
  ])
  expect(startIndex).toBe(1)
})

test('leaves out external images that the page does not load', () => {
  const doc = makeDoc([{src: 'https://tracker.example/pixel.png'}, {src: hosted('a')}])
  const {images, startIndex} = getLightboxImages(doc, positionsOf(doc)[1]!)
  expect(images).toEqual([{src: hosted('a'), alt: undefined}])
  expect(startIndex).toBe(0)
})
