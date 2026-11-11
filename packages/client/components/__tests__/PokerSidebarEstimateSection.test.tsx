import '../../tiptap/extensions/__tests__/installHappyDom'
import {act} from 'react'
import {createRoot, type Root} from 'react-dom/client'
import type {PokerSidebarEstimateSection_meeting$key} from '../../__generated__/PokerSidebarEstimateSection_meeting.graphql'
import {happyWindow} from '../../tiptap/extensions/__tests__/installHappyDom'
import clientTempId from '../../utils/relay/clientTempId'
import PokerSidebarEstimateSection from '../PokerSidebarEstimateSection'

interface Summary {
  title: string
  subtitle: string
  isComplete: boolean
  isNavigable: boolean
  isActive: boolean
  stageIds: [string, ...string[]]
  finalScores: (string | null)[]
  taskId: string
}

const mockState = {summaries: [] as Summary[]}

jest.mock('babel-plugin-relay/macro', () => ({__esModule: true, default: () => ({})}))
jest.mock('react-relay', () => ({
  ...jest.requireActual('react-relay'),
  useFragment: () => ({
    id: 'meeting1',
    endedAt: null,
    localStage: {id: 'stage1'},
    facilitatorStageId: 'stage1',
    phases: [{phaseType: 'ESTIMATE', stages: [], useMakeStageSummaries_phase: null}]
  })
}))
jest.mock('../../hooks/useAtmosphere', () => ({
  __esModule: true,
  default: () => ({viewerId: 'viewer1'})
}))
jest.mock('../../hooks/useMakeStageSummaries', () => ({
  __esModule: true,
  default: () => mockState.summaries
}))
jest.mock('../../mutations/DragEstimatingTaskMutation', () => ({
  __esModule: true,
  default: jest.fn()
}))
jest.mock('../MeetingSubnavItem', () => ({
  __esModule: true,
  default: ({children}: {children: React.ReactNode}) => <div>{children}</div>
}))
jest.mock('../PokerSidebarEstimateMeta', () => ({__esModule: true, default: () => null}))

const makeSummary = (stageId: string, taskId: string, title: string): Summary => ({
  title,
  subtitle: '',
  isComplete: false,
  isNavigable: true,
  isActive: false,
  stageIds: [stageId],
  finalScores: [null],
  taskId
})

const savedSummary = makeSummary('stage1', 'task1', 'Saved story')

let root: Root
let container: ReturnType<typeof happyWindow.document.createElement>
const uncaughtErrors: unknown[] = []
const onWindowError = (event: Parameters<typeof happyWindow.dispatchEvent>[0]) => {
  if (event instanceof happyWindow.ErrorEvent) uncaughtErrors.push(event.error)
}

const render = async () => {
  await act(async () =>
    root.render(
      <PokerSidebarEstimateSection
        gotoStageId={jest.fn()}
        handleMenuClick={() => {}}
        meeting={{} as PokerSidebarEstimateSection_meeting$key}
      />
    )
  )
}

const getItem = (title: string) =>
  [...container.querySelectorAll('[data-rfd-draggable-id]')].find((item) =>
    item.textContent?.includes(title)
  )!

const mouse = async (
  type: string,
  target: Pick<typeof happyWindow, 'dispatchEvent'>,
  clientX: number
) => {
  await act(async () => {
    target.dispatchEvent(
      new happyWindow.MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        button: 0,
        clientX,
        clientY: 0
      })
    )
  })
}

beforeEach(() => {
  container = happyWindow.document.createElement('div')
  happyWindow.document.body.appendChild(container)
  root = createRoot(container as unknown as HTMLElement)
  uncaughtErrors.length = 0
  happyWindow.addEventListener('error', onWindowError)
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
  happyWindow.removeEventListener('error', onWindowError)
  jest.restoreAllMocks()
})

test('a story still being added cannot be grabbed before the server saves it', async () => {
  const optimisticSummary = makeSummary(clientTempId(), clientTempId(), 'New story')
  mockState.summaries = [savedSummary, optimisticSummary]
  await render()

  const item = getItem('New story')
  await mouse('mousedown', item, 0)

  mockState.summaries = [savedSummary, makeSummary('stage2', 'task2', 'New story')]
  await render()

  await mouse('mousemove', happyWindow, 20)
  await mouse('mouseup', happyWindow, 20)

  expect(uncaughtErrors).toEqual([])
})

test('a saved story can be dragged', async () => {
  mockState.summaries = [savedSummary, makeSummary('stage2', 'task2', 'Other story')]
  await render()

  const item = getItem('Other story')
  await mouse('mousedown', item, 0)
  await mouse('mousemove', happyWindow, 20)

  expect(uncaughtErrors).toEqual([])
  expect(item.className).toContain('shadow')
  await mouse('mouseup', happyWindow, 20)
})
