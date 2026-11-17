import {Window} from 'happy-dom'
import {act, type ReactNode} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import type {SelectSharingScopeDropdown_template$key} from '../../__generated__/SelectSharingScopeDropdown_template.graphql'
import UpdateTemplateScopeMutation from '../../mutations/UpdateTemplateScopeMutation'
import SelectSharingScopeDropdown from '../SelectSharingScopeDropdown'

const mockEmit = jest.fn()
const mockAtmosphere = {eventEmitter: {emit: mockEmit}}
const mockNavigate = jest.fn()

jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))
jest.mock('react-relay', () => ({
  ...jest.requireActual('react-relay'),
  useFragment: (_fragment: unknown, fragmentRef: unknown) => fragmentRef
}))
jest.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({state: {prevCategory: 'standup'}})
}))
jest.mock('../../hooks/useAtmosphere', () => ({__esModule: true, default: () => mockAtmosphere}))
jest.mock('../../mutations/UpdateTemplateScopeMutation', () => ({
  __esModule: true,
  default: jest.fn()
}))
jest.mock('../../mutations/UpdatePokerTemplateScopeMutation', () => ({
  __esModule: true,
  default: jest.fn()
}))
jest.mock('../../ui/Menu/MenuContent', () => ({
  MenuContent: ({children}: {children: ReactNode}) => <div>{children}</div>
}))
jest.mock('../../ui/Menu/MenuItem', () => ({
  MenuItem: ({children, onClick}: {children: ReactNode; onClick: () => void}) => (
    <button onClick={onClick}>{children}</button>
  )
}))
jest.mock('../DropdownMenuIconItemLabel', () => ({
  __esModule: true,
  default: ({label}: {label: string}) => <span>{label}</span>
}))

const mockUpdateTemplateScope = jest.mocked(UpdateTemplateScopeMutation)

const template = {
  id: 'template1',
  scope: 'ORGANIZATION',
  type: 'teamPrompt',
  team: {name: 'Core', organization: {name: 'Acme'}}
} as unknown as SelectSharingScopeDropdown_template$key

const happyWindow = new Window({url: 'https://parabol.test/'})
let root: Root
let container: ReturnType<typeof happyWindow.document.createElement>

const shareOnlyWithTeam = async () => {
  const button = Array.from(container.querySelectorAll('button')).find((el) =>
    el.textContent?.includes('Share only with Core')
  )!
  await act(async () => (button as unknown as HTMLButtonElement).click())
  return mockUpdateTemplateScope.mock.lastCall![2]
}

beforeAll(() => {
  Object.assign(globalThis, {
    IS_REACT_ACT_ENVIRONMENT: true,
    window: happyWindow,
    document: happyWindow.document
  })
})

beforeEach(async () => {
  jest.clearAllMocks()
  container = happyWindow.document.createElement('div')
  happyWindow.document.body.appendChild(container)
  root = createRoot(container as unknown as Element)
  await act(async () => root.render(<SelectSharingScopeDropdown template={template} isEditing />))
})

afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
})

test('a downscope that clones the template opens the clone, still editing', async () => {
  const {onCompleted} = await shareOnlyWithTeam()

  await act(async () =>
    onCompleted(
      {
        updateTemplateScope: {
          UpdateTemplateScopeMutation_organization: {clonedTemplate: {id: 'clone1'}}
        }
      },
      null
    )
  )

  expect(mockNavigate).toHaveBeenCalledWith('/activity-library/details/clone1', {
    replace: true,
    state: {prevCategory: 'standup', edit: true}
  })
  expect(mockEmit).not.toHaveBeenCalled()
})

test('a downscope that clones the template does not start editing on its own', async () => {
  await act(async () =>
    root.render(<SelectSharingScopeDropdown template={template} isEditing={false} />)
  )
  const {onCompleted} = await shareOnlyWithTeam()

  await act(async () =>
    onCompleted(
      {
        updateTemplateScope: {
          UpdateTemplateScopeMutation_organization: {clonedTemplate: {id: 'clone1'}}
        }
      },
      null
    )
  )

  expect(mockNavigate).toHaveBeenCalledWith('/activity-library/details/clone1', {
    replace: true,
    state: {prevCategory: 'standup', edit: false}
  })
})

test('a downscope without a clone stays on the page', async () => {
  const {onCompleted} = await shareOnlyWithTeam()

  await act(async () =>
    onCompleted(
      {
        updateTemplateScope: {
          UpdateTemplateScopeMutation_organization: {clonedTemplate: null}
        }
      },
      null
    )
  )

  expect(mockNavigate).not.toHaveBeenCalled()
  expect(mockEmit).not.toHaveBeenCalled()
})

test('a thrown refusal is shown to the viewer', async () => {
  const {onCompleted} = await shareOnlyWithTeam()

  await act(async () =>
    onCompleted({}, [{message: "Another team's recurring meeting uses this template"}])
  )

  expect(mockEmit).toHaveBeenCalledWith(
    'addSnackbar',
    expect.objectContaining({message: "Another team's recurring meeting uses this template"})
  )
  expect(mockNavigate).not.toHaveBeenCalled()
})

test('an error in the payload is shown to the viewer', async () => {
  const {onCompleted} = await shareOnlyWithTeam()

  await act(async () =>
    onCompleted({updateTemplateScope: {error: {message: 'Template not found'}}}, null)
  )

  expect(mockEmit).toHaveBeenCalledWith(
    'addSnackbar',
    expect.objectContaining({message: 'Template not found'})
  )
})
