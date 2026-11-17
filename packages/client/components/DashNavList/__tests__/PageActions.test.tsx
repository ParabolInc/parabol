import '../../../tiptap/extensions/__tests__/installHappyDom'
import * as RadixTooltip from '@radix-ui/react-tooltip'
import {act} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {PageActions} from '../PageActions'

type MockPage = {
  id: string
  access: {viewer: string}
  isDatabase: boolean
  title: string
  parentPageId: string | null
  isPrivate: boolean
  isMeetingTOC: boolean
}

let mockPage: MockPage
const mockExecuteDuplicate = jest.fn()
let mockSubmitting = false

jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))
jest.mock('react-relay', () => ({useFragment: () => mockPage}))
jest.mock('react-router', () => ({useNavigate: () => jest.fn()}))
jest.mock('../../../hooks/useAtmosphere', () => ({
  __esModule: true,
  default: () => ({eventEmitter: {emit: jest.fn()}})
}))
jest.mock('../../../mutations/useArchivePageMutation', () => ({
  useArchivePageMutation: () => [jest.fn(), false] as const
}))
jest.mock('../../../mutations/useDuplicatePageMutation', () => ({
  useDuplicatePageMutation: () => [mockExecuteDuplicate, mockSubmitting] as const
}))
jest.mock('../../../tiptap/extensions/moveToPage/CopyToPageMenu', () => ({
  __esModule: true,
  default: () => <div data-copy-to-menu />
}))

let root: Root
let container: HTMLElement

beforeEach(() => {
  mockExecuteDuplicate.mockReset()
  mockSubmitting = false
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

const openMenu = async (overrides: Partial<MockPage> = {}) => {
  mockPage = {
    id: 'page:12',
    access: {viewer: 'viewer'},
    isDatabase: false,
    title: 'Roadmap',
    parentPageId: null,
    isPrivate: false,
    isMeetingTOC: false,
    ...overrides
  }
  act(() =>
    root.render(
      <RadixTooltip.Provider>
        <PageActions pageRef={{} as never} expandChildren={jest.fn()} />
      </RadixTooltip.Provider>
    )
  )
  const trigger = container.querySelector<HTMLButtonElement>(
    'button[aria-label="More page actions"]'
  )
  if (trigger) {
    await act(async () => {
      trigger.dispatchEvent(
        new KeyboardEvent('keydown', {key: 'ArrowDown', bubbles: true, cancelable: true})
      )
    })
  }
  return Array.from(document.body.querySelectorAll('[role="menuitem"]')).map(
    (item) => item.textContent
  )
}

test('a viewer sees Duplicate and Copy to… but not Delete page', async () => {
  expect(await openMenu()).toEqual(['Duplicate', 'Copy to…'])
})

test('an owner sees all three, Delete page last', async () => {
  expect(await openMenu({access: {viewer: 'owner'}})).toEqual([
    'Duplicate',
    'Copy to…',
    'Delete page'
  ])
})

test('Meeting Summaries shows neither Duplicate nor Copy to…', async () => {
  expect(await openMenu({access: {viewer: 'owner'}, isMeetingTOC: true})).toEqual(['Delete page'])
})

test('Duplicate sends duplicatePage with the page id', async () => {
  await openMenu()
  const duplicate = Array.from(
    document.body.querySelectorAll<HTMLElement>('[role="menuitem"]')
  ).find((item) => item.textContent === 'Duplicate')
  await act(async () => {
    duplicate!.click()
  })
  expect(mockExecuteDuplicate).toHaveBeenCalledTimes(1)
  expect(mockExecuteDuplicate.mock.calls[0]![0].variables).toEqual({
    pageId: 'page:12',
    parentPageId: undefined
  })
})

test('Copy to… opens the copy menu', async () => {
  await openMenu()
  const copyTo = Array.from(document.body.querySelectorAll<HTMLElement>('[role="menuitem"]')).find(
    (item) => item.textContent === 'Copy to…'
  )
  await act(async () => {
    copyTo!.click()
  })
  expect(document.body.querySelector('[data-copy-to-menu]')).not.toBeNull()
})

test('Duplicate and Copy to… are disabled while a copy is in flight', async () => {
  mockSubmitting = true
  await openMenu()
  const disabledItems = Array.from(document.body.querySelectorAll('[role="menuitem"]'))
    .filter((item) => item.getAttribute('aria-disabled') === 'true')
    .map((item) => item.textContent)
  expect(disabledItems).toEqual(['Duplicate', 'Copy to…'])
})
