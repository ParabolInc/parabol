import {Window} from 'happy-dom'
import {act} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import type {EmbedBlockAttrs} from '../../../../shared/tiptap/extensions/EmbedBlockBase'
import {EmbedBlockCard} from '../EmbedBlockCard'

const happyWindow = new Window({url: 'https://parabol.test/'})
let root: Root
let container: ReturnType<typeof happyWindow.document.createElement>

const EXTERNAL_THUMBNAIL = 'https://claude.example/og.png'
const HOSTED_THUMBNAIL = 'https://parabol.test/assets/Page/10/assets/og.avif'
const FAVICON = 'https://claude.example/favicon.ico'

const render = async (attrs: Partial<EmbedBlockAttrs>) => {
  const cardAttrs: EmbedBlockAttrs = {
    url: 'https://claude.example/artifact',
    displayMode: 'card',
    align: 'center',
    isFullWidth: false,
    aspectRatio: '16:9',
    title: 'Claude Artifact',
    ...attrs
  }
  await act(async () => root.render(<EmbedBlockCard attrs={cardAttrs} />))
}

const getImageSrcs = () =>
  Array.from(container.querySelectorAll('img')).map((img) => img.getAttribute('src'))

const settleImage = async (src: string, outcome: 'load' | 'error') => {
  const img = container.querySelector(`img[src="${src}"]`)
  await act(async () => {
    img?.dispatchEvent(new happyWindow.Event(outcome) as never)
  })
}
const failImage = (src: string) => settleImage(src, 'error')
const isHidden = (src: string) =>
  container.querySelector(`img[src="${src}"]`)?.classList.contains('invisible')

beforeAll(() => {
  Object.assign(globalThis, {
    IS_REACT_ACT_ENVIRONMENT: true,
    window: happyWindow,
    document: happyWindow.document
  })
})

beforeEach(() => {
  container = happyWindow.document.createElement('div')
  happyWindow.document.body.appendChild(container)
  root = createRoot(container as unknown as Element)
})

afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
})

test('a thumbnail stays invisible until it loads', async () => {
  await render({thumbnailUrl: HOSTED_THUMBNAIL})
  expect(isHidden(HOSTED_THUMBNAIL)).toBe(true)
  await settleImage(HOSTED_THUMBNAIL, 'load')
  expect(isHidden(HOSTED_THUMBNAIL)).toBe(false)
})

test('a thumbnail that fails to load is swapped for a placeholder of the same size', async () => {
  await render({thumbnailUrl: EXTERNAL_THUMBNAIL})
  expect(getImageSrcs()).toEqual([EXTERNAL_THUMBNAIL])
  await failImage(EXTERNAL_THUMBNAIL)
  expect(getImageSrcs()).toEqual([])
  expect(container.querySelector('.h-\\[120px\\].w-\\[200px\\]')).not.toBeNull()
})

test('a failed thumbnail loads again once the hosted copy replaces it', async () => {
  await render({thumbnailUrl: EXTERNAL_THUMBNAIL})
  await failImage(EXTERNAL_THUMBNAIL)
  await render({thumbnailUrl: HOSTED_THUMBNAIL})
  expect(getImageSrcs()).toEqual([HOSTED_THUMBNAIL])
  expect(isHidden(HOSTED_THUMBNAIL)).toBe(true)
})

test('a favicon that fails to load falls back to the globe', async () => {
  await render({faviconUrl: FAVICON})
  const globeCount = container.querySelectorAll('svg').length
  await failImage(FAVICON)
  expect(getImageSrcs()).toEqual([])
  expect(container.querySelectorAll('svg').length).toBe(globeCount + 1)
})
