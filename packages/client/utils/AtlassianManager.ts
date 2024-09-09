const MAX_REQUEST_TIME = 5000

export interface AtlassianError {
  code: number
  message: string
}

interface JiraNoAccessError {
  errorMessages: ['The app is not installed on this instance.']
}

interface JiraFieldError {
  errors: {
    [fieldName: string]: string
  }
}

interface JiraGetError {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
}

type JiraError = JiraNoAccessError | JiraFieldError | JiraGetError

export function isJiraNoAccessError<T extends object>(
  response: T | JiraNoAccessError
): response is JiraNoAccessError {
  return 'errorMessages' in response && response.errorMessages.length > 0
}

export type JiraPermissionScope =
  | 'read:jira-user'
  | 'read:jira-work'
  | 'write:jira-work'
  | 'offline_access'
  | 'manage:jira-project'

export class RateLimitError {
  retryAt: Date
  name = 'RateLimitError' as const
  message: string

  constructor(message: string, retryAt: Date) {
    this.message = message
    this.retryAt = retryAt
  }
}
Object.setPrototypeOf(RateLimitError.prototype, Error.prototype)

export default abstract class AtlassianManager {
  abstract fetch: typeof fetch
  static SCOPE: JiraPermissionScope[] = [
    'read:jira-user',
    'read:jira-work',
    'write:jira-work',
    'offline_access'
  ]
  accessToken: string
  protected headers = {
    Authorization: '',
    Accept: 'application/json' as const,
    'Content-Type': 'application/json' as const
  }
  protected readonly fetchWithTimeout = async (url: string, options: RequestInit) => {
    const controller = new AbortController()
    const {signal} = controller
    const timeout = setTimeout(() => {
      controller.abort()
    }, MAX_REQUEST_TIME)
    try {
      const res = await this.fetch(url, {...options, signal})
      clearTimeout(timeout)
      return res
    } catch (e) {
      clearTimeout(timeout)
      return new Error('Atlassian is down')
    }
  }
  protected readonly get = async <T extends object>(url: string) => {
    const res = await this.fetchWithTimeout(url, {headers: this.headers})
    if (res instanceof Error) {
      return res
    }
    const {headers} = res
    if (res.status === 429) {
      const retryAfterSeconds = headers.get('Retry-After') ?? '3'
      return new RateLimitError(
        'got jira rate limit error',
        new Date(Date.now() + Number(retryAfterSeconds) * 1000)
      )
    }
    const contentType = headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return new Error('Received non-JSON Atlassian Response')
    }
    const json = (await res.json()) as AtlassianError | JiraNoAccessError | JiraGetError | T
    if ('message' in json) {
      if (json.message === 'No message available' && 'error' in json) {
        return new Error(json.error)
      }
      return new Error(json.message)
    }
    if (isJiraNoAccessError(json)) {
      return new Error(json.errorMessages[0])
    }
    return json
  }
  protected readonly post = async <T extends object>(url: string, payload: any) => {
    const res = await this.fetchWithTimeout(url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(payload)
    })
    if (res instanceof Error) {
      return res
    }
    const json = (await res.json()) as JiraError | AtlassianError | T
    if ('message' in json) {
      return new Error(json.message)
    }
    if (isJiraNoAccessError(json)) {
      return new Error(json.errorMessages[0])
    }
    if ('errors' in json) {
      const errorFieldName = Object.keys(json.errors)[0] || 'Unknown'
      return new Error(`${errorFieldName}: ${json.errors[errorFieldName]}`)
    }
    return json
  }
  protected readonly put = async (url: string, payload: any) => {
    const res = await this.fetchWithTimeout(url, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(payload)
    })
    if (res instanceof Error) {
      return res
    }

    if (res.status === 204) return null
    const error = (await res.json()) as AtlassianError | JiraError
    if ('message' in error) {
      return new Error(error.message)
    }
    if (isJiraNoAccessError(error)) {
      return new Error(error.errorMessages[0])
    }
    if ('errors' in error) {
      const errorFieldName = Object.keys(error.errors)[0]
      if (errorFieldName) {
        return new Error(`${errorFieldName}: ${error.errors[errorFieldName]}`)
      }
    }
    return new Error(`Unknown Jira error: ${JSON.stringify(error)}`)
  }
  protected readonly delete = async (url: string) => {
    const res = await this.fetchWithTimeout(url, {
      method: 'DELETE',
      headers: this.headers
    })
    if (res instanceof Error) {
      return res
    }

    if (res.status === 204) return null
    const error = (await res.json()) as AtlassianError | JiraError
    if ('message' in error) {
      return new Error(error.message)
    }
    if (isJiraNoAccessError(error)) {
      return new Error(error.errorMessages[0])
    }
    if ('errors' in error) {
      const errorFieldName = Object.keys(error.errors)[0]
      if (errorFieldName) {
        return new Error(`${errorFieldName}: ${error.errors[errorFieldName]}`)
      }
    }

    return new Error(`Unknown Jira error: ${JSON.stringify(error)}`)
  }

  constructor(accessToken: string) {
    this.accessToken = accessToken
    this.headers.Authorization = `Bearer ${accessToken}`
  }
}
