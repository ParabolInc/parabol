import type Atmosphere from '../../../Atmosphere'

const PRINT_SNACKBAR_KEY = 'syncedBlocksPrint'
const SNACKBAR_DELAY_MS = 500

let mountAllRequested = false
const mountAllListeners = new Set<() => void>()

const setMountAll = (isRequested: boolean) => {
  mountAllRequested = isRequested
  mountAllListeners.forEach((listener) => listener())
}

export const subscribeToMountAll = (listener: () => void) => {
  mountAllListeners.add(listener)
  return () => {
    mountAllListeners.delete(listener)
  }
}

export const isMountAllRequested = () => mountAllRequested

export const requestMountAllSyncedBlocks = () => setMountAll(true)

export const releaseMountAll = () => setMountAll(false)

export const waitForSyncedBlocks = (root: ParentNode, timeoutMs = 10_000) =>
  new Promise<void>((resolve) => {
    let settledFrames = 0
    let isDone = false
    const finish = () => {
      if (isDone) return
      isDone = true
      clearTimeout(timer)
      resolve()
    }
    const timer = setTimeout(finish, timeoutMs)
    const check = () => {
      if (isDone) return
      const isLoading = !!root.querySelector('[data-synced-block][data-status="loading"]')
      settledFrames = isLoading ? 0 : settledFrames + 1
      if (settledFrames >= 2) return finish()
      requestAnimationFrame(check)
    }
    requestAnimationFrame(check)
  })

const RELEASE_FALLBACK_MS = 60_000
let pendingPrint: Promise<void> | null = null

const runPrint = async (atmosphere: Atmosphere) => {
  requestMountAllSyncedBlocks()
  let isSnackbarShown = false
  const snackbarTimer = setTimeout(() => {
    isSnackbarShown = true
    atmosphere.eventEmitter.emit('addSnackbar', {
      key: PRINT_SNACKBAR_KEY,
      message: 'Getting synced blocks ready to print…',
      autoDismiss: 0
    })
  }, SNACKBAR_DELAY_MS)
  await waitForSyncedBlocks(document)
  clearTimeout(snackbarTimer)
  if (isSnackbarShown) {
    atmosphere.eventEmitter.emit('removeSnackbar', ({key}) => key === PRINT_SNACKBAR_KEY)
  }
  const fallbackTimer = setTimeout(releaseMountAll, RELEASE_FALLBACK_MS)
  window.addEventListener(
    'afterprint',
    () => {
      clearTimeout(fallbackTimer)
      releaseMountAll()
    },
    {once: true}
  )
  window.print()
}

export const printPage = (atmosphere: Atmosphere) => {
  if (!pendingPrint) {
    pendingPrint = runPrint(atmosphere).finally(() => {
      pendingPrint = null
    })
  }
  return pendingPrint
}
