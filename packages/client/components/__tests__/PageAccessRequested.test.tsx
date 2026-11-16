import '../../tiptap/extensions/__tests__/installHappyDom'
import {act, type ReactNode} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import PageAccessRequested from '../PageAccessRequested'

let mockNotification: object

jest.mock('babel-plugin-relay/macro', () => ({
  __esModule: true,
  default: () => ({})
}))
jest.mock('react-relay', () => ({
  ...jest.requireActual('react-relay'),
  useFragment: () => mockNotification
}))
jest.mock('react-router', () => ({useNavigate: () => jest.fn()}))
jest.mock('../NotificationTemplate', () => ({
  __esModule: true,
  default: ({message}: {message: ReactNode}) => <div>{message}</div>
}))
jest.mock('~/components/NotificationAction', () => ({
  __esModule: true,
  default: () => null
}))

let root: Root
let container: HTMLElement

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

const render = (isSyncedBlock: boolean, title = 'Escalation path') => {
  mockNotification = {
    id: 'notification:1',
    name: 'Ravi Menon',
    email: 'ravi@example.com',
    picture: '',
    role: 'viewer',
    page: {id: 'page:7', title, isSyncedBlock}
  }
  act(() => root.render(<PageAccessRequested notification={{} as never} />))
}

test('a block request reads "wants to view the synced block", or <Untitled> without a name', () => {
  render(true)
  expect(container.textContent).toBe('Ravi Menon wants to view the synced block Escalation path.')
  render(true, '')
  expect(container.textContent).toBe('Ravi Menon wants to view the synced block <Untitled>.')
})

test('a page request keeps its wording', () => {
  render(false)
  expect(container.textContent).toContain('has requested to view the page')
})
