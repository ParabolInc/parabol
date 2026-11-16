export const waitUntil = (
  isDone: () => boolean,
  subscribe: (onChange: () => void) => () => void,
  timeoutMs: number
) =>
  new Promise<boolean>((resolve) => {
    if (isDone()) {
      resolve(true)
      return
    }
    const finish = (done: boolean) => {
      clearTimeout(timer)
      unsubscribe()
      resolve(done)
    }
    const timer = setTimeout(() => finish(false), timeoutMs)
    const unsubscribe = subscribe(() => {
      if (isDone()) finish(true)
    })
  })
