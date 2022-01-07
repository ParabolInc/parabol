import LogRocket from 'logrocket'

const safeInitLogRocket = (viewerId?: string, email?: string) => {
  const logRocketId = window.__ACTION__.logRocket
  if (!logRocketId) return
  LogRocket.init(logRocketId, {
    release: __APP_VERSION__,
    network: {
      requestSanitizer: (request) => {
        const body = request?.body?.toLowerCase()
        if (body?.includes('password')) return null
        return request
      }
    }
  })
  if (email && viewerId) {
    LogRocket.identify(viewerId, {
      email
    })
  }
}

export default safeInitLogRocket
