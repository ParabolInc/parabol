import type Atmosphere from '../../../Atmosphere'

export const SYNCED_BLOCK_MOUNT_ALL_EVENT = 'syncedBlockMountAll'
const PRINT_SNACKBAR_KEY = 'syncedBlocksPrint'
const SNACKBAR_DELAY_MS = 500

let mountAllRequested = false

export const requestMountAllSyncedBlocks = () => {
  mountAllRequested = true
  window.dispatchEvent(new Event(SYNCED_BLOCK_MOUNT_ALL_EVENT))
}

export const isMountAllRequested = () => mountAllRequested

export const releaseMountAll = () => {
  mountAllRequested = false
}

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

export const printPage = async (atmosphere: Atmosphere) => {
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
  window.addEventListener('afterprint', releaseMountAll, {once: true})
  window.print()
}
