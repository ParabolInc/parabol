import {RouterProvider} from '@tanstack/react-router'
import {Window} from 'happy-dom'
import {StrictMode} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {loadQuery, RelayEnvironmentProvider} from 'react-relay'
import {
  createOperationDescriptor,
  Environment,
  getRequest,
  Network,
  Observable,
  RecordSource,
  Store
} from 'relay-runtime'
import type {ViewerNotOnTeamQuery} from '../../__generated__/ViewerNotOnTeamQuery.graphql'
import {createTestRouter, destroyTestRouters} from '../../routing/__tests__/testRouter'
import ViewerNotOnTeam from '../ViewerNotOnTeam'

jest.mock('babel-plugin-relay/macro', () => ({
  __esModule: true,
  default: (strings: TemplateStringsArray) => {
    const [, name] = strings.join('').match(/(?:fragment|query|mutation|subscription)\s+(\w+)/)!
    return jest.requireActual(`../../__generated__/${name}.graphql`).default
  }
}))
jest.mock('../TeamInvitationWrapper', () => ({__esModule: true, default: () => null}))

const viewerNotOnTeamQuery = getRequest(
  jest.requireActual('../../__generated__/ViewerNotOnTeamQuery.graphql').default
)
const variables = {teamId: 'team1', meetingId: null}

const happyWindow = new Window({url: 'https://parabol.test/'})
const tick = () => new Promise((resolve) => setTimeout(resolve, 10))
let root: Root
let container: HTMLElement

beforeAll(() => {
  Object.assign(globalThis, {
    window: happyWindow,
    document: happyWindow.document,
    self: happyWindow,
    location: happyWindow.location
  })
})

afterAll(async () => {
  await happyWindow.happyDOM.close()
})

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  root.unmount()
  destroyTestRouters()
  container.remove()
})

test('a teammate sent here by an older auth token goes back with a fresh one', async () => {
  happyWindow.history.replaceState(
    null,
    '',
    '/invitation-required?redirectTo=/team/team1&teamId=team1'
  )
  const refreshSession = jest.fn<void, [() => void]>()
  const atmosphere = Object.assign(
    new Environment({
      network: Network.create(() => Observable.create(() => {})),
      store: new Store(new RecordSource())
    }),
    {refreshSession}
  )
  const operation = createOperationDescriptor(viewerNotOnTeamQuery, variables)
  atmosphere.commitPayload(operation, {
    viewer: {
      __typename: 'User',
      id: 'viewer1',
      teamInvitation: {isOnTeam: true, teamInvitation: null, teamId: 'team1', meetingId: null}
    }
  })
  const queryRef = loadQuery<ViewerNotOnTeamQuery>(atmosphere, viewerNotOnTeamQuery, variables, {
    fetchPolicy: 'store-only'
  })
  const router = createTestRouter({
    routes: {
      '/invitation-required': <ViewerNotOnTeam queryRef={queryRef} />,
      '/team/$teamId': <main>Team</main>
    }
  })
  root.render(
    <StrictMode>
      <RelayEnvironmentProvider environment={atmosphere}>
        <RouterProvider router={router} />
      </RelayEnvironmentProvider>
    </StrictMode>
  )
  for (let i = 0; i < 100 && refreshSession.mock.calls.length === 0; i++) await tick()
  expect(refreshSession).toHaveBeenCalledTimes(1)
  expect(happyWindow.location.pathname).toBe('/invitation-required')

  refreshSession.mock.calls[0]![0]()
  await tick()
  expect(happyWindow.location.pathname).toBe('/team/team1')
  // the team page reads the viewer again instead of the answer the older token got
  expect(atmosphere.check(operation).status).toBe('stale')
})
