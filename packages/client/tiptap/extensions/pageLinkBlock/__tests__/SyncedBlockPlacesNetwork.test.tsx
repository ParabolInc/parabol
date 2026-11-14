import '../../__tests__/installHappyDom'
import {Editor} from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import EventEmitter from 'eventemitter3'
import {act, type ReactNode} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {RelayEnvironmentProvider} from 'react-relay'
import {
  Environment,
  type GraphQLResponse,
  Network,
  Observable,
  RecordSource,
  Store
} from 'relay-runtime'
import {PageLinkBlockBase} from '../../../../shared/tiptap/extensions/PageLinkBlockBase'
import {Menu} from '../../../../ui/Menu/Menu'
import {happyWindow} from '../../__tests__/installHappyDom'
import {SyncedBlockMenuContent} from '../SyncedBlockMenuContent'
import {SyncedBlockPlacesRoot} from '../SyncedBlockPlacesRoot'
import {findLinkPositions, syncedLink} from './syncedBlockTestHarness'

jest.mock('babel-plugin-relay/macro', () => ({
  __esModule: true,
  default: (template: TemplateStringsArray) => {
    const source = template.join('')
    if (source.includes('query SyncedBlockPlacesQuery'))
      return jest.requireActual('../../../../__generated__/SyncedBlockPlacesQuery.graphql').default
    if (source.includes('fragment SyncedBlockPlaces_page'))
      return jest.requireActual('../../../../__generated__/SyncedBlockPlaces_page.graphql').default
    return {}
  }
}))
jest.mock('../../../../hooks/useAtmosphere', () => {
  const atmosphere = {retries: new Set(), eventEmitter: new EventEmitter()}
  return {__esModule: true, default: () => atmosphere}
})
jest.mock('../../../../utils/reportClientError', () => ({__esModule: true, default: () => {}}))
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => jest.fn()
}))

const placesResponse = (pageCode: number): GraphQLResponse => ({
  data: {
    public: {
      id: 'public',
      page: {
        id: `page:${pageCode}`,
        access: {viewer: 'owner'},
        syncedBlockPlacements: {
          pages: [
            {isOriginal: true, page: {id: 'page:1', title: 'Handbook', deletedAt: null}},
            {isOriginal: false, page: {id: 'page:2', title: 'Runbook', deletedAt: null}}
          ],
          hiddenCount: 0,
          successor: null
        }
      }
    }
  }
})

const tooManyRequests: GraphQLResponse = {
  errors: [{name: 'GraphQLError', message: 'Too Many Requests'}]
}

let root: Root
let container: HTMLElement
const editors: Editor[] = []

beforeAll(() => {
  jest.useFakeTimers({advanceTimers: true})
})

afterAll(async () => {
  jest.useRealTimers()
  await happyWindow.happyDOM.close()
})

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
  editors.splice(0).forEach((editor) => editor.destroy())
  document.body.replaceChildren()
})

const makeEnvironment = (respond: () => GraphQLResponse) => {
  const fetchPlaces = jest.fn(() =>
    Observable.create<GraphQLResponse>((sink) => {
      const timer = setTimeout(() => {
        sink.next(respond())
        sink.complete()
      })
      return () => clearTimeout(timer)
    })
  )
  const environment = new Environment({
    network: Network.create(fetchPlaces),
    store: new Store(new RecordSource(), {gcReleaseBufferSize: 10})
  })
  return {environment, fetchPlaces}
}

const flush = () => act(() => new Promise((resolve) => setTimeout(resolve, 0)))

const renderIn = async (environment: Environment, children: ReactNode) => {
  await act(async () =>
    root.render(
      <RelayEnvironmentProvider environment={environment}>{children}</RelayEnvironmentProvider>
    )
  )
  await flush()
}

const placesRoot = (pageCode: number, lastLabel: string | null = null) => (
  <SyncedBlockPlacesRoot
    pageCode={pageCode}
    currentPageId='page:1'
    isViewOnly={false}
    lastLabel={lastLabel}
    onLabel={() => {}}
    onOpenChange={() => {}}
  />
)

const placesButton = () =>
  Array.from(container.querySelectorAll('button')).find((button) =>
    button.textContent?.startsWith('Also on')
  )

test('five bar shows within a minute ask the server once', async () => {
  const pageCode = 9001
  const {environment, fetchPlaces} = makeEnvironment(() => placesResponse(pageCode))
  for (let show = 0; show < 5; show++) {
    await renderIn(environment, placesRoot(pageCode))
    expect(placesButton()?.textContent).toBe('Also on 1 page')
    await renderIn(environment, null)
  }
  expect(fetchPlaces).toHaveBeenCalledTimes(1)
})

const hostEditor = () => {
  const editor = new Editor({
    element: document.createElement('div'),
    extensions: [StarterKit, PageLinkBlockBase.extend({addStorage: () => ({pageId: 'page:1'})})],
    content: {type: 'doc', content: [{type: 'paragraph'}, syncedLink]}
  })
  editors.push(editor)
  return editor
}

const moreMenu = (pageCode: number) => {
  const host = hostEditor()
  const linkPos = findLinkPositions(host)[0]!
  return (
    <Menu open onOpenChange={() => {}} trigger={<button type='button'>More</button>}>
      <SyncedBlockMenuContent
        hostEditor={host}
        getPos={() => linkPos}
        pageCode={pageCode}
        isOriginal={false}
        isViewOnly={false}
        isMounted
        currentPageId='page:2'
        onClose={() => {}}
        contentProps={{}}
      />
    </Menu>
  )
}

test('the bar and its menu share one request', async () => {
  const pageCode = 9002
  const {environment, fetchPlaces} = makeEnvironment(() => placesResponse(pageCode))
  await renderIn(environment, placesRoot(pageCode))
  await renderIn(
    environment,
    <>
      {placesRoot(pageCode)}
      {moreMenu(pageCode)}
    </>
  )
  expect(document.body.textContent).toContain('Go to original')
  expect(fetchPlaces).toHaveBeenCalledTimes(1)
})

test('a refused places request leaves the bar with its last label', async () => {
  const {environment} = makeEnvironment(() => tooManyRequests)
  await renderIn(environment, placesRoot(9003, 'Also on 2 pages'))
  expect(placesButton()?.textContent).toBe('Also on 2 pages')
})

test('a refused places request leaves the bar with the loading label when it has none', async () => {
  const {environment} = makeEnvironment(() => tooManyRequests)
  await renderIn(environment, placesRoot(9004))
  expect(placesButton()?.textContent).toBe('Also on …')
})

test('a refused places request leaves the menu rows that do not need the original', async () => {
  const {environment} = makeEnvironment(() => tooManyRequests)
  await renderIn(environment, moreMenu(9005))
  const menuText = document.body.textContent ?? ''
  expect(menuText).toContain('Copy and sync')
  expect(menuText).toContain('Delete from this page')
  expect(menuText).not.toContain('Go to original')
})
