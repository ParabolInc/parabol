import '../../__tests__/installHappyDom'
import {act} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {SyncedBlockWhoHasAccess} from '../SyncedBlockWhoHasAccess'

interface AccessLineData {
  isParentLinked: boolean
  parentPage: {title: string | null} | null
}

const mockSharingProps = jest.fn()
let mockLine: AccessLineData = {
  isParentLinked: true,
  parentPage: {title: 'Incident response runbook'}
}

jest.mock('../../../../modules/pages/PageSharingRoot', () => ({
  PageSharingRoot: (props: {pageId: string; hideCopyLink?: boolean}) => {
    mockSharingProps(props)
    return <div data-testid='sharing' />
  }
}))
jest.mock('../../../../hooks/useQueryLoaderNow', () => ({__esModule: true, default: () => ({})}))
jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))
jest.mock('react-relay', () => ({
  ...jest.requireActual('react-relay'),
  usePreloadedQuery: () => ({public: {page: mockLine}})
}))

let root: Root
let container: HTMLElement

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  mockSharingProps.mockClear()
  mockLine = {isParentLinked: true, parentPage: {title: 'Incident response runbook'}}
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

const renderPopover = (name = 'Escalation path') =>
  act(() =>
    root.render(
      <SyncedBlockWhoHasAccess
        pageCode={7}
        name={name}
        onClose={jest.fn()}
        onCloseAutoFocus={jest.fn()}
      />
    )
  )

test('opens the share panel on the block page without Copy link', () => {
  renderPopover()
  expect(mockSharingProps).toHaveBeenCalledWith({pageId: 'page:7', hideCopyLink: true})
  expect(document.body.textContent).toContain('Escalation path')
  expect(
    document.body.querySelector('[aria-label="Who has access to this synced block"]')
  ).not.toBeNull()
})

test('names an unnamed block Synced block', () => {
  renderPopover('')
  expect(document.body.textContent).toContain('Synced block')
})

test('says where inherited access comes from', () => {
  renderPopover()
  expect(document.body.textContent).toContain(
    'Everyone who can open Incident response runbook can see this block.'
  )
})

test('says nothing about inheritance once the block is unlinked', () => {
  mockLine = {isParentLinked: false, parentPage: {title: 'Incident response runbook'}}
  renderPopover()
  expect(document.body.textContent).not.toContain('Everyone who can open')
})
