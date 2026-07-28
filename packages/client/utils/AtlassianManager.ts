import {MAX_REQUEST_TIME} from './constants'

export interface AtlassianError {
  code: number
  message: string
}

export interface JiraNoAccessError {
  errorMessages: ['The app is not installed on this instance.']
}

interface JiraFieldError {
  errors: {
    [fieldName: string]: string
  }
}

export interface JiraGetError {
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

export type ConfluencePermissionScope =
  | 'read:page:confluence'
  | 'write:page:confluence'
  | 'read:space:confluence'
  | 'write:attachment:confluence'
  | 'read:content-details:confluence'

export type AtlassianPermissionScope = JiraPermissionScope | ConfluencePermissionScope

export interface HeldAtlassianProducts {
  jira: boolean
  confluence: boolean
}

/**
 * Atlassian re-consent REPLACES the token's grant, so every authorize request must
 * include the union of the requested product scopes and whatever the user already
 * holds — otherwise connecting/refreshing one product silently breaks the other.
 * If the union would contain no product scopes at all, falls back to the Jira set
 * (the legacy default) so a bare call can never mint a useless token.
 */
export const unionAtlassianScopes = (
  requested: readonly AtlassianPermissionScope[],
  held: HeldAtlassianProducts
): AtlassianPermissionScope[] => {
  const scopes = new Set<AtlassianPermissionScope>(requested)
  if (held.jira) {
    AtlassianManager.SCOPE.forEach((scope) => scopes.add(scope))
  }
  if (held.confluence) {
    AtlassianManager.CONFLUENCE_SCOPE.forEach((scope) => scopes.add(scope))
    scopes.add('offline_access')
  }
  const hasProductScope = [...scopes].some((scope) => scope !== 'offline_access')
  if (!hasProductScope) {
    AtlassianManager.SCOPE.forEach((scope) => scopes.add(scope))
  }
  return [...scopes]
}

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
  // FINE-GRAINED granular scopes only — verified live 2026-07-27: the Confluence OAuth
  // gateway rejects classic scopes AND the coarse read/write:content umbrellas with 401
  // "scope does not match" on both v1 and v2 content routes. No search scope exists for
  // granular apps (the parent picker lists recent space pages via read:page instead).
  static CONFLUENCE_SCOPE: ConfluencePermissionScope[] = [
    'read:page:confluence',
    'write:page:confluence',
    'read:space:confluence',
    // v1 attachment upload (the only upload endpoint) requires BOTH of these
    'write:attachment:confluence',
    'read:content-details:confluence'
  ]
  accessToken: string
  protected headers = {
    Authorization: '',
    Accept: 'application/json' as const,
    'Content-Type': 'application/json' as const
  }

  protected readonly get = async <T extends object>(url: string) => {
    const res = await this.getOnce<T>(url)
    // Freshly-minted OAuth tokens can lag at Atlassian's edge and transiently 401
    // with this exact message right after consent. One bounded retry absorbs the
    // blip; a genuine scope mismatch just surfaces the same error 750ms later.
    // GETs only — mutating requests must never auto-retry.
    if (res instanceof Error && res.message === 'Unauthorized; scope does not match') {
      await new Promise((resolve) => setTimeout(resolve, 750))
      return this.getOnce<T>(url)
    }
    return res
  }

  private readonly getOnce = async <T extends object>(url: string) => {
    try {
      const res = await this.fetch(url, {
        headers: this.headers,
        signal: AbortSignal.timeout(MAX_REQUEST_TIME)
      })
      const {headers} = res
      if (res.status === 429) {
        await res.body?.cancel()
        const retryAfterSeconds = headers.get('Retry-After') ?? '3'
        return new RateLimitError(
          'got jira rate limit error',
          new Date(Date.now() + Number(retryAfterSeconds) * 1000)
        )
      }
      const contentType = headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        await res.body?.cancel()
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
    } catch (error) {
      if (error instanceof Error) {
        return error
      }
      return new Error('Atlassian is down')
    }
  }
  protected readonly post = async <T extends object>(url: string, payload: any) => {
    try {
      const res = await this.fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(MAX_REQUEST_TIME)
      })
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
    } catch (error) {
      if (error instanceof Error) {
        return error
      }
      return new Error('Atlassian is down')
    }
  }
  protected readonly put = async (url: string, payload: any) => {
    try {
      const res = await this.fetch(url, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(MAX_REQUEST_TIME)
      })

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
    } catch (error) {
      if (error instanceof Error) {
        return error
      }
      return new Error('Atlassian is down')
    }
  }
  protected readonly delete = async (url: string) => {
    try {
      const res = await this.fetch(url, {
        method: 'DELETE',
        headers: this.headers,
        signal: AbortSignal.timeout(MAX_REQUEST_TIME)
      })

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
    } catch (error) {
      if (error instanceof Error) {
        return error
      }
      return new Error('Atlassian is down')
    }
  }

  constructor(accessToken: string) {
    this.accessToken = accessToken
    this.headers.Authorization = `Bearer ${accessToken}`
  }
}
