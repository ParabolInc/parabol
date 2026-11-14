import type {Editor} from '@tiptap/core'
import type Atmosphere from '../../../Atmosphere'
import type {Snack, SnackbarRemoveFn} from '../../../components/Snackbar'
import type {MovedBlock} from '../appendBlocksToFragment'
import type {BlockMoveMeta} from '../blockMoveUndoStack'
import type {BlockMoveOutcome} from '../moveBlocksToPage'
import {takePendingArrival} from '../pendingArrivals'
import {showBlockMoveSnack} from '../showBlockMoveSnack'
import type {TrackedRange} from '../trackRange'
import {undoBlockMove} from '../undoBlockMove'

jest.mock('../undoBlockMove', () => ({undoBlockMove: jest.fn()}))

const emit = jest.fn()
const atmosphere = {eventEmitter: {emit}} as unknown as Atmosphere
const makeEditor = () => {
  const listeners = new Map<string, Set<() => void>>()
  const fake = {
    on: (event: string, listener: () => void) => {
      if (!listeners.has(event)) listeners.set(event, new Set())
      listeners.get(event)!.add(listener)
    },
    off: (event: string, listener: () => void) => {
      listeners.get(event)?.delete(listener)
    },
    destroy: () => {
      listeners.get('destroy')?.forEach((listener) => listener())
    }
  }
  return fake as unknown as Editor
}
const editor = makeEditor()
const navigate = jest.fn()
const moved: MovedBlock[] = [{client: 1, clock: 4, snapshot: '<paragraph></paragraph>'}]
const meta: BlockMoveMeta = {
  targetPageId: 'page:42',
  targetTitle: 'Q3 Roadmap',
  moved,
  blocks: []
}
const makeGap = () => ({current: () => ({from: 1, to: 1}), stop: jest.fn()}) satisfies TrackedRange

const show = (outcome: BlockMoveOutcome, sourceEditor = editor) => {
  showBlockMoveSnack({
    atmosphere,
    editor: sourceEditor,
    navigate,
    outcome,
    count: 1,
    targetPageId: 'page:42',
    targetTitle: 'Q3 Roadmap'
  })
  return emit.mock.calls.findLast(([event]) => event === 'addSnackbar')?.[1] as Snack | undefined
}

beforeEach(() => {
  jest.clearAllMocks()
  takePendingArrival('page:42')
})

test('a move offers Open page and Undo', () => {
  const gap = makeGap()
  const snack = show({result: 'moved', meta, gap, moved})!
  expect(snack).toMatchObject({
    key: 'blockMove',
    autoDismiss: 10,
    message: 'Moved 1 block to Q3 Roadmap'
  })
  snack.action!.callback()
  expect(navigate).toHaveBeenCalledWith('/pages/q3-roadmap-42')
  snack.secondaryAction!.callback()
  expect(undoBlockMove).toHaveBeenCalledWith(editor, meta, gap)
})

test('Open page hands the arrived blocks to the target page before navigating', () => {
  let pendingAtNavigate: readonly MovedBlock[] | null = null
  navigate.mockImplementationOnce(() => {
    pendingAtNavigate = takePendingArrival('page:42')
  })
  const snack = show({result: 'copied', meta: null, gap: null, moved})!
  expect(takePendingArrival('page:42')).toBeNull()
  snack.action!.callback()
  expect(pendingAtNavigate).toBe(moved)
})

test('a new move snack replaces the one on screen', () => {
  show({result: 'moved', meta, gap: makeGap(), moved})
  emit.mockClear()
  show({result: 'offline', meta: null, gap: null, moved: null})
  expect(emit.mock.calls.map(([event]) => event)).toEqual(['removeSnackbar', 'addSnackbar'])
  const removeFn = emit.mock.calls[0]![1] as SnackbarRemoveFn
  expect(removeFn({key: 'blockMove', message: '', autoDismiss: 10})).toBe(true)
  expect(removeFn({key: 'acceptSuggestedGroups', message: '', autoDismiss: 10})).toBe(false)
})

test('stops tracking the gap when the snackbar is dismissed', () => {
  const gap = makeGap()
  const snack = show({result: 'moved', meta, gap, moved})!
  expect(gap.stop).not.toHaveBeenCalled()
  snack.onDismiss!()
  expect(gap.stop).toHaveBeenCalled()
})

test('stops tracking the gap when a newer move snack replaces it', () => {
  const gap = makeGap()
  show({result: 'moved', meta, gap, moved})
  show({result: 'moved', meta, gap: makeGap(), moved})
  expect(gap.stop).toHaveBeenCalled()
})

test('leaving the page takes its move snack away', () => {
  const sourceEditor = makeEditor()
  const gap = makeGap()
  const snack = show({result: 'moved', meta, gap, moved}, sourceEditor)!
  emit.mockClear()
  sourceEditor.destroy()
  expect(emit.mock.calls.map(([event]) => event)).toEqual(['removeSnackbar'])
  const removeFn = emit.mock.calls[0]![1] as SnackbarRemoveFn
  expect(removeFn({...snack, key: 'blockMove'})).toBe(true)
  expect(removeFn({key: 'blockMove', message: '', autoDismiss: 10})).toBe(false)
  expect(gap.stop).toHaveBeenCalled()
})

test('leaving the page leaves a newer move snack alone', () => {
  const sourceEditor = makeEditor()
  show({result: 'moved', meta, gap: makeGap(), moved}, sourceEditor)
  show({result: 'offline', meta: null, gap: null, moved: null})
  emit.mockClear()
  sourceEditor.destroy()
  expect(emit).not.toHaveBeenCalled()
})

test('a move that carried a child page offers no Undo', () => {
  const snack = show({result: 'moved', meta: null, gap: makeGap(), moved})!
  expect(snack.action!.label).toBe('Open page')
  expect(snack.secondaryAction).toBeUndefined()
})

test('a copy offers Open page only', () => {
  const snack = show({result: 'copied', meta: null, gap: null, moved})!
  expect(snack.action!.label).toBe('Open page')
  expect(snack.secondaryAction).toBeUndefined()
})

test('a refusal offers no actions', () => {
  const snack = show({result: 'offline', meta: null, gap: null, moved: null})!
  expect(snack.message).toBe('Couldn’t move: you’re offline. Nothing changed.')
  expect(snack.action).toBeUndefined()
  expect(snack.secondaryAction).toBeUndefined()
})

test('a block that vanished mid-drag shows nothing', () => {
  show({result: 'gone', meta: null, gap: null, moved: null})
  expect(emit).not.toHaveBeenCalled()
})
