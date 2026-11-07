import '../../tiptap/extensions/__tests__/installHappyDom'
import {act, type ReactNode} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import type {PreloadedQuery} from 'react-relay'
import type {ClickUpScopingSearchFilterMenuQuery} from '../../__generated__/ClickUpScopingSearchFilterMenuQuery.graphql'
import {
  EMPTY_SCOPING_SEARCH_STATE,
  type ScopingSearchState
} from '../../integrations/platform/ScopingSearchState'
import {happyWindow} from '../../tiptap/extensions/__tests__/installHappyDom'
import ClickUpScopingSearchFilterMenu from '../ClickUpScopingSearchFilterMenu'

const MAX_RENDERS = 50
const mockRenders = {count: 0}
const mockSetSearchState = jest.fn()
const REPOS = [
  {id: 'repo1', name: 'Space / Alpha', integrationRepoId: '1'},
  {id: 'repo2', name: 'Space / Beta', integrationRepoId: '2'}
]
const mockClickUpService: {service: string; repos: typeof REPOS | null} = {
  service: 'clickup',
  repos: REPOS
}
const mockData = {viewer: {teamMember: {services: [{service: 'github'}, mockClickUpService]}}}

jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))
jest.mock('react-relay', () => ({
  ...jest.requireActual('react-relay'),
  usePreloadedQuery: () => mockData
}))
jest.mock('../../hooks/useSetScopingSearchState', () => ({
  __esModule: true,
  default: () => {
    mockRenders.count++
    if (mockRenders.count > MAX_RENDERS) throw new Error(`over ${MAX_RENDERS} renders`)
    return mockSetSearchState
  }
}))
jest.mock('../../ui/Menu/MenuItem', () => ({
  MenuItem: ({children, onClick}: {children: ReactNode; onClick: () => void}) => (
    <button onClick={onClick}>{children}</button>
  )
}))
jest.mock('../TypeAheadLabel', () => ({
  __esModule: true,
  default: ({label}: {label: string}) => <span>{label}</span>
}))
jest.mock('../Checkbox', () => ({
  __esModule: true,
  default: ({active}: {active: boolean}) => <span data-checked={String(active)} />
}))

const queryRef = {} as PreloadedQuery<ClickUpScopingSearchFilterMenuQuery>
let root: Root
let container: ReturnType<typeof happyWindow.document.createElement>

const renderMenu = (state: ScopingSearchState) =>
  act(async () =>
    root.render(
      <ClickUpScopingSearchFilterMenu meetingId='meeting1' state={state} queryRef={queryRef} />
    )
  )

const typeIntoSearch = async (text: string) => {
  const input = container.querySelector('input[name="search"]')!
  const setInputValue = Object.getOwnPropertyDescriptor(
    happyWindow.HTMLInputElement.prototype,
    'value'
  )!.set!
  await act(async () => {
    setInputValue.call(input, text)
    input.dispatchEvent(new happyWindow.Event('input', {bubbles: true}))
  })
}

const listItems = () => Array.from(container.querySelectorAll('button'))
const listLabels = () => listItems().map((el) => el.textContent)
const checkedLabels = () =>
  listItems()
    .filter((el) => el.querySelector('[data-checked="true"]'))
    .map((el) => el.textContent)
const listIdFilters = (...listIds: string[]) => listIds.map((value) => ({key: 'listIds', value}))

beforeEach(async () => {
  jest.clearAllMocks()
  mockClickUpService.repos = REPOS
  mockRenders.count = 0
  container = happyWindow.document.createElement('div')
  happyWindow.document.body.appendChild(container)
  root = createRoot(container as unknown as Element)
  await renderMenu(EMPTY_SCOPING_SEARCH_STATE)
  mockRenders.count = 0
})

afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
})

test('typing into the list search settles after a few renders', async () => {
  await typeIntoSearch('alpha')

  expect(mockRenders.count).toBeLessThan(5)
  expect(listLabels()).toEqual(['Space / Alpha'])
})

test('a new search state settles after a few renders', async () => {
  await renderMenu({...EMPTY_SCOPING_SEARCH_STATE, filters: [{key: 'listIds', value: '1'}]})

  expect(mockRenders.count).toBeLessThan(5)
  expect(listLabels()).toEqual(['Space / Alpha', 'Space / Beta'])
})

test('picking a list adds its List id to the filters', async () => {
  const beta = Array.from(container.querySelectorAll('button')).find(
    (el) => el.textContent === 'Space / Beta'
  )!
  await act(async () => (beta as unknown as HTMLButtonElement).click())

  expect(mockSetSearchState).toHaveBeenCalledWith({filters: [{key: 'listIds', value: '2'}]})
})

test('a picked list that no longer resolves stays checked so it can be cleared', async () => {
  await renderMenu({...EMPTY_SCOPING_SEARCH_STATE, filters: listIdFilters('2', '901423080038')})

  expect(listLabels()).toEqual(['List no longer available', 'Space / Beta', 'Space / Alpha'])
  expect(checkedLabels()).toEqual(['List no longer available', 'Space / Beta'])

  const unavailable = listItems().find((el) => el.textContent === 'List no longer available')!
  await act(async () => (unavailable as unknown as HTMLButtonElement).click())

  expect(mockSetSearchState).toHaveBeenCalledWith({filters: listIdFilters('2')})
})

test('picked lists stay listed when the lists fail to load', async () => {
  await act(async () => root.unmount())
  root = createRoot(container as unknown as Element)
  mockClickUpService.repos = null
  await renderMenu({...EMPTY_SCOPING_SEARCH_STATE, filters: listIdFilters('1')})

  expect(listLabels()).toEqual(['List could not be loaded'])
  expect(checkedLabels()).toEqual(['List could not be loaded'])
  expect(container.textContent).not.toContain('No lists found!')
})

test('a picked list stays listed while the search matches other lists', async () => {
  await renderMenu({...EMPTY_SCOPING_SEARCH_STATE, filters: listIdFilters('2')})
  await typeIntoSearch('alpha')

  expect(listLabels()).toEqual(['Space / Beta', 'Space / Alpha'])
  expect(checkedLabels()).toEqual(['Space / Beta'])
})
