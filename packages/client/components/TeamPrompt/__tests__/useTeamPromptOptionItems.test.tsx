import {Window} from 'happy-dom'
import {act} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import type {useTeamPromptOptionItems_meeting$key} from '../../../__generated__/useTeamPromptOptionItems_meeting.graphql'
import useTeamPromptOptionItems from '../useTeamPromptOptionItems'

jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))
jest.mock('react-relay', () => ({
  ...jest.requireActual('react-relay'),
  useFragment: (_fragment: unknown, fragmentRef: unknown) => fragmentRef
}))
jest.mock('react-router', () => ({useNavigate: () => jest.fn()}))
jest.mock('../../../hooks/useAtmosphere', () => ({
  __esModule: true,
  default: () => ({viewerId: 'viewer'})
}))
jest.mock('../../../mutations/EndTeamPromptMutation', () => ({
  __esModule: true,
  default: jest.fn()
}))
jest.mock('../../../modules/teamDashboard/components/ProviderRow/ProviderRowEntry', () => ({
  getProviderAnchorId: () => 'slack'
}))
jest.mock('../../SlackSVG', () => ({__esModule: true, default: () => null}))

const happyWindow = new Window({url: 'https://parabol.test/'})
let root: Root

const optionKeysFor = async (template: {
  id: string
  isActive: boolean
  viewerLowestScope: string
}) => {
  const meeting = {
    id: 'meeting1',
    team: {id: 'team1'},
    template,
    meetingSeries: null,
    responses: [],
    endedAt: null
  } as unknown as useTeamPromptOptionItems_meeting$key
  let keys: string[] = []
  const Harness = () => {
    keys = useTeamPromptOptionItems(meeting, {
      openRecurrenceSettingsModal: () => {},
      openEndRecurringMeetingModal: () => {},
      onCopied: () => {}
    }).map(({key}) => key)
    return null
  }
  await act(async () => root.render(<Harness />))
  return keys
}

beforeAll(() => {
  Object.assign(globalThis, {
    IS_REACT_ACT_ENVIRONMENT: true,
    window: happyWindow,
    document: happyWindow.document
  })
})

beforeEach(() => {
  root = createRoot(happyWindow.document.createElement('div') as unknown as Element)
})

afterEach(async () => {
  await act(async () => root.unmount())
})

test('a team template offers Edit template', async () => {
  const keys = await optionKeysFor({id: 't1', isActive: true, viewerLowestScope: 'TEAM'})
  expect(keys).toContain('template')
})

test('a retired template does not offer Edit template', async () => {
  const keys = await optionKeysFor({id: 't1', isActive: false, viewerLowestScope: 'TEAM'})
  expect(keys).not.toContain('template')
})
