const shimRIC: Window['requestIdleCallback'] = (cb) => {
  const start = Date.now()
  return window.setTimeout(() => {
    // eslint-disable-next-line
    cb({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
    })
    // google shim default is 1, i like 100 to ensure the render tree got done
  }, 100)
}

const shimCancel = (id: number | undefined) => window.clearTimeout(id)

export const requestIdleCallback =
  (typeof window !== 'undefined' && (window as any).requestIdleCallback) || shimRIC
export const cancelIdleCallback =
  (typeof window !== 'undefined' && (window as any).cancelIdleCallback) || shimCancel
