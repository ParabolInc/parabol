import '../../../../tiptap/extensions/__tests__/installHappyDom'
import {act, type ReactNode} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import type {ClickUpListFilterBar_teamMember$key} from '../../../../__generated__/ClickUpListFilterBar_teamMember.graphql'
import {happyWindow} from '../../../../tiptap/extensions/__tests__/installHappyDom'
import ClickUpListFilterBar from '../ClickUpListFilterBar'

const MAX_RENDERS = 50
const mockRenders = {count: 0}
const REPOS = [
  {id: 'repo1', name: 'Space / Alpha', integrationRepoId: '1'},
  {id: 'repo2', name: 'Space / Beta', integrationRepoId: '2'}
]
const mockClickUpService: {service: string; repos: typeof REPOS | null} = {
  service: 'clickup',
  repos: REPOS
}
const mockTeamMember = {services: [{service: 'github'}, mockClickUpService]}

jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))
jest.mock('react-relay', () => ({
  ...jest.requireActual('react-relay'),
  useFragment: () => {
    mockRenders.count++
    if (mockRenders.count > MAX_RENDERS) throw new Error(`over ${MAX_RENDERS} renders`)
    return mockTeamMember
  }
}))
jest.mock('../../../../ui/Menu/Menu', () => ({
  Menu: ({trigger, children}: {trigger: ReactNode; children: ReactNode}) => (
    <>
      {trigger}
      {children}
    </>
  )
}))
jest.mock('../../../../ui/Menu/MenuContent', () => ({
  MenuContent: ({children}: {children: ReactNode}) => <div>{children}</div>
}))
jest.mock('../../../../ui/Menu/MenuItem', () => ({
  MenuItem: ({children, onClick}: {children: ReactNode; onClick: () => void}) => (
    <button data-list-item onClick={onClick}>
      {children}
    </button>
  )
}))
jest.mock('../../../TypeAheadLabel', () => ({
  __esModule: true,
  default: ({label}: {label: string}) => <span>{label}</span>
}))
jest.mock('../../../Checkbox', () => ({
  __esModule: true,
  default: ({active}: {active: boolean}) => <span data-checked={String(active)} />
}))

const teamMemberRef = {} as ClickUpListFilterBar_teamMember$key
const mockSetSelectedListIds = jest.fn()
let root: Root
let container: ReturnType<typeof happyWindow.document.createElement>

const renderBar = (selectedListIds: string[]) =>
  act(async () =>
    root.render(
      <ClickUpListFilterBar
        teamMemberRef={teamMemberRef}
        selectedListIds={selectedListIds}
        setSelectedListIds={mockSetSelectedListIds}
      />
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

const listItems = () => Array.from(container.querySelectorAll('[data-list-item]'))
const listLabels = () => listItems().map((el) => el.textContent)
const checkedLabels = () =>
  listItems()
    .filter((el) => el.querySelector('[data-checked="true"]'))
    .map((el) => el.textContent)
const triggerLabel = () => container.querySelector('button[type="button"]')!.textContent

beforeEach(async () => {
  jest.clearAllMocks()
  mockClickUpService.repos = REPOS
  mockRenders.count = 0
  container = happyWindow.document.createElement('div')
  happyWindow.document.body.appendChild(container)
  root = createRoot(container as unknown as Element)
  await renderBar([])
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

test('picking a list selects its List id', async () => {
  const beta = listItems().find((el) => el.textContent === 'Space / Beta')!
  await act(async () => (beta as unknown as HTMLButtonElement).click())

  expect(mockSetSelectedListIds).toHaveBeenCalledWith(['2'])
})

test('picking a selected list clears it', async () => {
  await renderBar(['1', '2'])
  const alpha = listItems().find((el) => el.textContent === 'Space / Alpha')!
  await act(async () => (alpha as unknown as HTMLButtonElement).click())

  expect(mockSetSelectedListIds).toHaveBeenCalledWith(['2'])
})

test('the button counts the selected lists', async () => {
  expect(triggerLabel()).toBe('All lists')
  await renderBar(['2'])
  expect(triggerLabel()).toBe('1 list selected')
})

test('a picked list that no longer resolves stays checked so it can be cleared', async () => {
  await renderBar(['2', '901423080038'])

  expect(triggerLabel()).toBe('2 lists selected')
  expect(checkedLabels()).toEqual(['List no longer available', 'Space / Beta'])
  expect(mockSetSelectedListIds).not.toHaveBeenCalled()

  const unavailable = listItems().find((el) => el.textContent === 'List no longer available')!
  await act(async () => (unavailable as unknown as HTMLButtonElement).click())

  expect(mockSetSelectedListIds).toHaveBeenCalledWith(['2'])
})

test('picked lists are kept when the lists fail to load', async () => {
  await act(async () => root.unmount())
  root = createRoot(container as unknown as Element)
  mockClickUpService.repos = null
  await renderBar(['1'])

  expect(triggerLabel()).toBe('1 list selected')
  expect(checkedLabels()).toEqual(['List could not be loaded'])
  expect(mockSetSelectedListIds).not.toHaveBeenCalled()
})
