import LogRocket from 'logrocket'

interface User {
  id: string
  email: string
}

class LogRocketManager {
  private applicationId = window.__ACTION__.logRocket
  public isEnabled = this.applicationId !== undefined

  private user?: User
  private isInitialized = false

  public getInstance(): typeof LogRocket | undefined {
    if (!this.applicationId) {
      return
    }

    if (!this.isInitialized) {
      this.initialize()
    }

    return LogRocket
  }

  public initialize() {
    if (!this.applicationId) return

    LogRocket.init(this.applicationId, {
      release: __APP_VERSION__,
      network: {
        requestSanitizer: (request) => {
          const body = request?.body?.toLowerCase()
          if (body?.includes('password')) return null
          return request
        }
      }
    })
    this.identify()

    this.isInitialized = true
  }

  public setUser(id: string, email: string) {
    this.user = {
      id,
      email
    }

    this.identify()
  }

  public unsetUser() {
    this.user = undefined

    this.identify()
  }

  private identify() {
    if (this.user) {
      const {id, email} = this.user
      LogRocket.identify(id, {
        email
      })
    }
  }
}

export default new LogRocketManager()
