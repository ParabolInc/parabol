import '../../tiptap/extensions/__tests__/installHappyDom'
import {act} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {fetchQuery} from 'react-relay'
import type {TaskFooterIntegrateMenuList_teamMember$key} from '../../__generated__/TaskFooterIntegrateMenuList_teamMember.graphql'
import {happyWindow} from '../../tiptap/extensions/__tests__/installHappyDom'
import TaskFooterIntegrateMenuList from '../TaskFooterIntegrateMenuList'

jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))
jest.mock('react-relay', () => ({
  ...jest.requireActual('react-relay'),
  useFragment: (_fragment: unknown, ref: unknown) => ref,
  fetchQuery: jest.fn()
}))
jest.mock('../../hooks/useAtmosphere', () => {
  const atmosphere = {}
  return {__esModule: true, default: () => atmosphere}
})
jest.mock('../../integrations/platform/registry', () => ({
  isTaskClientIntegration: () => true,
  listClientIntegrationServices: (services: readonly object[]) =>
    services.map((integrationService) => ({integrationService}))
}))
jest.mock('../../ui/Menu/MenuSearch', () => ({MenuSearch: () => null}))
jest.mock('../../ui/Menu/MenuSeparator', () => ({MenuSeparator: () => null}))
jest.mock('../../ui/Menu/MenuSkeletonRows', () => ({
  __esModule: true,
  default: () => <div data-skeleton />
}))
jest.mock('../TaskIntegrationMenuItem', () => ({
  __esModule: true,
  default: ({label}: {label: string}) => <div data-item>{label}</div>
}))
jest.mock('../TaskFooterIntegrateMenuNeedsReconnect', () => ({
  __esModule: true,
  default: () => null
}))
jest.mock('../TaskFooterIntegrateMenuToolFailure', () => ({
  __esModule: true,
  default: () => <div data-failure />
}))

const project = {
  id: 'repo1',
  integrationRepoId: 'cloud1:PMO',
  service: 'jira',
  name: 'PMO'
}

const makeTeamMember = (repos: (typeof project)[]) =>
  ({
    teamId: 'team1',
    prevUsedRepoIntegrations: {items: []},
    services: [{service: 'jira', title: 'Jira Cloud', isConnected: true, repos}]
  }) as unknown as TaskFooterIntegrateMenuList_teamMember$key

let root: Root
let container: ReturnType<typeof happyWindow.document.createElement>
let completeRefetch: () => void

const render = async (repos: (typeof project)[]) => {
  await act(async () =>
    root.render(
      <TaskFooterIntegrateMenuList
        mutationProps={{
          onCompleted: jest.fn(),
          onError: jest.fn(),
          submitMutation: jest.fn(),
          submitting: false
        }}
        newlyConnectedService='jira'
        placeholder='Search Jira Cloud'
        teamMemberRef={makeTeamMember(repos)}
        onPushToIntegration={jest.fn()}
      />
    )
  )
}

beforeEach(() => {
  jest.mocked(fetchQuery).mockReturnValue({
    subscribe: ({complete}: {complete: () => void}) => {
      completeRefetch = complete
    }
  } as unknown as ReturnType<typeof fetchQuery>)
  container = happyWindow.document.createElement('div')
  happyWindow.document.body.appendChild(container)
  root = createRoot(container as unknown as HTMLElement)
})

afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
  jest.clearAllMocks()
})

test('a tool just connected in the menu loads its projects instead of showing the empty list from before', async () => {
  await render([])

  expect(fetchQuery).toHaveBeenCalledWith(
    expect.anything(),
    expect.anything(),
    {teamId: 'team1'},
    {fetchPolicy: 'network-only'}
  )
  expect(container.querySelector('[data-skeleton]')).not.toBeNull()

  await render([project])
  await act(async () => completeRefetch())

  expect(container.querySelector('[data-skeleton]')).toBeNull()
  expect(container.querySelector('[data-item]')?.textContent).toBe('PMO')
})
