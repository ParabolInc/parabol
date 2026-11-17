import {Window} from 'happy-dom'
import {act, useState} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {MemoryRouter} from 'react-router'
import type {TemplateDetails_activity$key} from '~/__generated__/TemplateDetails_activity.graphql'
import type {TemplateDetails_user$key} from '~/__generated__/TemplateDetails_user.graphql'
import {setActiveTemplate} from '../../../../utils/relay/setActiveTemplate'
import {TemplateDetails} from '../TemplateDetails'

jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))
jest.mock('react-relay', () => ({
  ...jest.requireActual('react-relay'),
  useFragment: (_fragment: unknown, fragmentRef: unknown) => fragmentRef
}))
const mockAtmosphere = {}
jest.mock('../../../../hooks/useAtmosphere', () => ({
  __esModule: true,
  default: () => mockAtmosphere
}))
jest.mock('../../../../utils/relay/setActiveTemplate', () => ({setActiveTemplate: jest.fn()}))
jest.mock('../../../../utils/useTemplateDescription', () => ({
  __esModule: true,
  default: () => ''
}))
jest.mock('../../../../mutations/RemovePokerTemplateMutation', () => ({
  __esModule: true,
  default: jest.fn()
}))
jest.mock('../../../../mutations/RemovePromptTemplateMutation', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('../../../../modules/meeting/components/AddPokerTemplateDimension', () => ({
  __esModule: true,
  default: () => null
}))
jest.mock('../../../../modules/meeting/components/AddTemplatePrompt', () => ({
  __esModule: true,
  default: () => null
}))
jest.mock('../../../../modules/meeting/components/CloneTemplate', () => ({
  __esModule: true,
  default: () => null
}))
jest.mock('../../../../modules/meeting/components/PokerTemplateScaleDetails', () => ({
  __esModule: true,
  default: () => null
}))
jest.mock('../../../../modules/meeting/components/TemplateDimensionList', () => ({
  __esModule: true,
  default: () => null
}))
jest.mock('../../../../modules/meeting/components/TemplatePromptList', () => ({
  __esModule: true,
  default: () => null
}))
jest.mock('../../../DetailAction', () => ({__esModule: true, default: () => null}))
jest.mock('../../ActivityCardFavorite', () => ({__esModule: true, default: () => null}))
jest.mock('../../TeamHealth/TeamHealthTemplateQuestionEditor', () => ({
  __esModule: true,
  default: () => null
}))
jest.mock('../../TeamPickerModal', () => ({__esModule: true, default: () => null}))
jest.mock('../ActivityDetailsBadges', () => ({__esModule: true, default: () => null}))
jest.mock('../../../../modules/meeting/components/TemplateSharing', () => ({
  UnstyledTemplateSharing: () => null
}))
jest.mock('../components/IntegrationsTip', () => ({IntegrationsTip: () => null}))

const mockSetActiveTemplate = jest.mocked(setActiveTemplate)

const makeActivity = (id: string) =>
  ({
    __typename: 'PromptTemplate',
    id,
    category: 'standup',
    type: 'teamPrompt',
    team: {id: 'team1', editingScaleId: null},
    viewerLowestScope: 'TEAM',
    prompts: []
  }) as unknown as TemplateDetails_activity$key

const viewer = {teams: [], preferredTeamId: 'team1'} as unknown as TemplateDetails_user$key

let setActivity: (activity: TemplateDetails_activity$key) => void

const Harness = () => {
  const [activity, setActivityState] = useState(() => makeActivity('template1'))
  setActivity = setActivityState
  return (
    <MemoryRouter>
      <TemplateDetails
        activityRef={activity}
        viewerRef={viewer}
        isEditing
        setIsEditing={setIsEditing}
      />
    </MemoryRouter>
  )
}
const setIsEditing = () => {}

const happyWindow = new Window({url: 'https://parabol.test/'})
let root: Root
let container: ReturnType<typeof happyWindow.document.createElement>

beforeAll(() => {
  Object.assign(globalThis, {
    IS_REACT_ACT_ENVIRONMENT: true,
    window: happyWindow,
    document: happyWindow.document
  })
})

beforeEach(async () => {
  mockSetActiveTemplate.mockReset()
  container = happyWindow.document.createElement('div')
  happyWindow.document.body.appendChild(container)
  root = createRoot(container as unknown as Element)
  await act(async () => root.render(<Harness />))
})

afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
})

test('a new activity object for the same template does not set the active template again', async () => {
  expect(mockSetActiveTemplate).toHaveBeenCalledTimes(1)

  await act(async () => setActivity(makeActivity('template1')))

  expect(mockSetActiveTemplate).toHaveBeenCalledTimes(1)
})

test('moving to another template sets the active template again', async () => {
  await act(async () => setActivity(makeActivity('template2')))

  expect(mockSetActiveTemplate).toHaveBeenCalledTimes(2)
  expect(mockSetActiveTemplate.mock.lastCall).toEqual([
    expect.anything(),
    'team1',
    'template2',
    'teamPrompt'
  ])
})
