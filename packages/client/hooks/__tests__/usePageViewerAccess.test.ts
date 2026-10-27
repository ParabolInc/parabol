import {commitLocalUpdate, Environment, Network, RecordSource, Store} from 'relay-runtime'
import mockPageViewerAccessFragment from '../../__generated__/usePageViewerAccess_page.graphql'
import {lookupPageViewerAccess, subscribeToPageViewerAccess} from '../usePageViewerAccess'

jest.mock('babel-plugin-relay/macro', () => ({
  __esModule: true,
  default: () => mockPageViewerAccessFragment
}))
jest.mock('../useAtmosphere', () => ({__esModule: true, default: () => null}))

const makeEnvironment = () =>
  new Environment({
    network: Network.create(() => Promise.reject(new Error('no network'))),
    store: new Store(
      new RecordSource({
        'page:1': {
          __id: 'page:1',
          __typename: 'Page',
          id: 'page:1',
          access: {__ref: 'page:1:access'}
        },
        'page:1:access': {__id: 'page:1:access', __typename: 'PageAccess', viewer: 'editor'},
        'page:2': {__id: 'page:2', __typename: 'PagePreview', id: 'page:2'},
        'page:3': {__id: 'page:3', __typename: 'Page', id: 'page:3'}
      })
    )
  })

const setViewerAccess = (environment: Environment, pageCode: number, role: string | null) => {
  commitLocalUpdate(environment, (store) => {
    const page = store.get(`page:${pageCode}`)!
    const access =
      page.getLinkedRecord('access') ?? store.create(`page:${pageCode}:access`, 'PageAccess')
    access.setValue(role, 'viewer')
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

test('a page stored as a PagePreview unlocks once the viewer is granted access', () => {
  const environment = makeEnvironment()
  setViewerAccess(environment, 2, 'viewer')
  expect(lookupPageViewerAccess(environment, 2)).toBe('viewer')
})

test('subscribers hear when the viewer gains or loses access', () => {
  const environment = makeEnvironment()
  const onChange = jest.fn()
  const unsubscribe = subscribeToPageViewerAccess(environment, 2, onChange)
  setViewerAccess(environment, 2, 'editor')
  expect(onChange).toHaveBeenCalledTimes(1)
  setViewerAccess(environment, 2, null)
  expect(onChange).toHaveBeenCalledTimes(2)
  expect(lookupPageViewerAccess(environment, 2)).toBeNull()
  unsubscribe()
  setViewerAccess(environment, 2, 'owner')
  expect(onChange).toHaveBeenCalledTimes(2)
})
