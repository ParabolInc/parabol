import '../../__tests__/installHappyDom'
import type Atmosphere from '../../../../Atmosphere'
import {
  isMountAllRequested,
  printPage,
  releaseMountAll,
  waitForSyncedBlocks
} from '../syncedBlockPrint'

const addBlock = (status: string, parent: ParentNode = document.body) => {
  const block = document.createElement('div')
  block.setAttribute('data-synced-block', '')
  block.setAttribute('data-status', status)
  parent.appendChild(block)
  return block
}

const flush = async (ms: number) => {
  await jest.advanceTimersByTimeAsync(ms)
}

describe('syncedBlockPrint', () => {
  const originalRaf = globalThis.requestAnimationFrame
  const originalPrint = window.print
  beforeEach(() => {
    jest.useFakeTimers()
    globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) =>
      setTimeout(() => cb(0), 0) as unknown as number) as typeof globalThis.requestAnimationFrame
    window.print = jest.fn()
  })
  afterEach(() => {
    jest.useRealTimers()
    globalThis.requestAnimationFrame = originalRaf
    window.print = originalPrint
    document.body.innerHTML = ''
    releaseMountAll()
  })

  test('a locked or failed block counts as loaded', async () => {
    addBlock('locked')
    addBlock('error')
    let done = false
    waitForSyncedBlocks(document).then(() => {
      done = true
    })
    await flush(100)
    expect(done).toBe(true)
  })

  test('waits for a block that appears while waiting', async () => {
    const first = addBlock('loading')
    let done = false
    waitForSyncedBlocks(document).then(() => {
      done = true
    })
    await flush(10)
    first.setAttribute('data-status', 'ready')
    const nested = addBlock('loading', first)
    await flush(100)
    expect(done).toBe(false)
    nested.setAttribute('data-status', 'ready')
    await flush(100)
    expect(done).toBe(true)
  })

  test('gives up after the timeout', async () => {
    addBlock('loading')
    let done = false
    waitForSyncedBlocks(document).then(() => {
      done = true
    })
    await flush(9_000)
    expect(done).toBe(false)
    await flush(1_100)
    expect(done).toBe(true)
  })

  test('prints after the wait and releases on afterprint', async () => {
    const emit = jest.fn()
    const atmosphere = {eventEmitter: {emit}} as unknown as Atmosphere
    const printing = printPage(atmosphere)
    expect(isMountAllRequested()).toBe(true)
    await flush(100)
    await printing
    expect(window.print).toHaveBeenCalledTimes(1)
    expect(isMountAllRequested()).toBe(true)
    window.dispatchEvent(new Event('afterprint'))
    expect(isMountAllRequested()).toBe(false)
  })

  test('shows the snackbar only for a slow wait', async () => {
    const emit = jest.fn()
    const atmosphere = {eventEmitter: {emit}} as unknown as Atmosphere
    await Promise.all([printPage(atmosphere), flush(100)])
    expect(emit).not.toHaveBeenCalledWith('addSnackbar', expect.anything())
    window.dispatchEvent(new Event('afterprint'))

    const slow = addBlock('loading')
    const printing = printPage(atmosphere)
    await flush(800)
    expect(emit).toHaveBeenCalledWith(
      'addSnackbar',
      expect.objectContaining({
        key: 'syncedBlocksPrint',
        message: 'Getting synced blocks ready to print…'
      })
    )
    expect(emit).not.toHaveBeenCalledWith('removeSnackbar', expect.anything())
    slow.setAttribute('data-status', 'ready')
    await flush(100)
    await printing
    const removeCall = emit.mock.calls.find(([name]) => name === 'removeSnackbar')
    expect(removeCall).toBeDefined()
    const matches = removeCall![1] as (snack: {key: string}) => boolean
    expect(matches({key: 'syncedBlocksPrint'})).toBe(true)
    expect(matches({key: 'other'})).toBe(false)
  })

  test('a second call during the wait prints once', async () => {
    const atmosphere = {eventEmitter: {emit: jest.fn()}} as unknown as Atmosphere
    const slow = addBlock('loading')
    const first = printPage(atmosphere)
    const second = printPage(atmosphere)
    expect(second).toBe(first)
    await flush(100)
    slow.setAttribute('data-status', 'ready')
    await flush(100)
    await Promise.all([first, second])
    expect(window.print).toHaveBeenCalledTimes(1)
  })

  test('releases after a fallback timer when afterprint never fires', async () => {
    const atmosphere = {eventEmitter: {emit: jest.fn()}} as unknown as Atmosphere
    const printing = printPage(atmosphere)
    await flush(100)
    await printing
    expect(isMountAllRequested()).toBe(true)
    await flush(59_000)
    expect(isMountAllRequested()).toBe(true)
    await flush(1_500)
    expect(isMountAllRequested()).toBe(false)
  })
})
