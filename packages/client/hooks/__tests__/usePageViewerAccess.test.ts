import {commitLocalUpdate, Environment, Network, RecordSource, Store} from 'relay-runtime'
import mockPageFragment from '../../__generated__/usePageViewerAccess_page.graphql'
import mockPagePreviewFragment from '../../__generated__/usePageViewerAccess_pagePreview.graphql'
import {lookupPageViewerAccess, subscribeToPageViewerAccess} from '../usePageViewerAccess'

// the hook declares its page fragment first & its pagePreview fragment second
jest.mock('babel-plugin-relay/macro', () => {
  const fragments = [mockPageFragment, mockPagePreviewFragment]
  let calls = 0
  return {__esModule: true, default: () => fragments[calls++]}
})
jest.mock('../useAtmosphere', () => ({__esModule: true, default: () => null}))

const pageWithAccess = (pageCode: number, viewer: string | null, publicRole: string | null) => ({
  [`page:${pageCode}`]: {
    __id: `page:${pageCode}`,
    __typename: 'Page',
    id: `page:${pageCode}`,
    access: {__ref: `page:${pageCode}:access`}
  },
  [`page:${pageCode}:access`]: {
    __id: `page:${pageCode}:access`,
    __typename: 'PageAccess',
    viewer,
    public: publicRole
  }
})

const makeEnvironment = () =>
  new Environment({
    network: Network.create(() => Promise.reject(new Error('no network'))),
    store: new Store(
      new RecordSource({
        ...pageWithAccess(1, 'editor', null),
        'pagePreview:2': {__id: 'pagePreview:2', __typename: 'PagePreview', id: 'pagePreview:2'},
        'page:3': {__id: 'page:3', __typename: 'Page', id: 'page:3'},
        ...pageWithAccess(5, null, 'viewer'),
        ...pageWithAccess(6, 'commenter', 'editor')
      })
    )
  })

// what UpdatePageAccessPayload writes: the page record with the viewer's & public roles
const setAccess = (
  environment: Environment,
  pageCode: number,
  viewer: string | null,
  publicRole: string | null
) => {
  commitLocalUpdate(environment, (store) => {
    const page = store.get(`page:${pageCode}`) ?? store.create(`page:${pageCode}`, 'Page')
    page.setValue(`page:${pageCode}`, 'id')
    const access =
      page.getLinkedRecord('access') ?? store.create(`page:${pageCode}:access`, 'PageAccess')
    access.setValue(viewer, 'viewer')
    access.setValue(publicRole, 'public')
    page.setLinkedRecord(access, 'access')
  })
}

test('returns the role when the access is loaded', () => {
  expect(lookupPageViewerAccess(makeEnvironment(), 1)).toBe('editor')
})

test('returns null for a page the viewer cannot open', () => {
  expect(lookupPageViewerAccess(makeEnvironment(), 2)).toBeNull()
})

test('returns undefined when the access is not loaded', () => {
  const environment = makeEnvironment()
  expect(lookupPageViewerAccess(environment, 3)).toBeUndefined()
  expect(lookupPageViewerAccess(environment, 4)).toBeUndefined()
})

test('counts access through the public link', () => {
  const environment = makeEnvironment()
  expect(lookupPageViewerAccess(environment, 5)).toBe('viewer')
  expect(lookupPageViewerAccess(environment, 6)).toBe('editor')
})

test('a page the viewer could not open unlocks once they are granted access, and locks when it is removed', () => {
  const environment = makeEnvironment()
  setAccess(environment, 2, 'viewer', null)
  expect(lookupPageViewerAccess(environment, 2)).toBe('viewer')
  setAccess(environment, 2, null, null)
  expect(lookupPageViewerAccess(environment, 2)).toBeNull()
})

test('subscribers hear when the viewer gains or loses access', () => {
  const environment = makeEnvironment()
  const onChange = jest.fn()
  const unsubscribe = subscribeToPageViewerAccess(environment, 2, onChange)
  setAccess(environment, 2, 'editor', null)
  expect(onChange).toHaveBeenCalled()
  const callsAfterGrant = onChange.mock.calls.length
  setAccess(environment, 2, null, null)
  expect(onChange.mock.calls.length).toBeGreaterThan(callsAfterGrant)
  unsubscribe()
  const callsBeforeUnsubscribe = onChange.mock.calls.length
  setAccess(environment, 2, 'owner', null)
  expect(onChange.mock.calls.length).toBe(callsBeforeUnsubscribe)
})
