import {fetch} from '@whatwg-node/fetch'
import deactivateTeamMemberIntegrationAuthFamily from '../../postgres/queries/deactivateTeamMemberIntegrationAuthFamily'
import type {TeamMemberIntegrationAuth} from '../../postgres/types'
import type {JsonObject} from '../../postgres/types/pg'
import {readThirdPartyResponse, ThirdPartyResponseError} from '../../utils/ThirdPartyResponseError'
import type {ClickUpApiError} from './ClickUpApiTypes'

const CLICKUP_API_URL = 'https://api.clickup.com/api/v2'
const REQUEST_TIMEOUT_MS = 15_000
const REVOKED_GRANT_CODES = new Set(['OAUTH_019', 'OAUTH_021', 'OAUTH_025', 'OAUTH_077'])
const UNSHARED_WORKSPACE_CODES = new Set([
  'OAUTH_023',
  'OAUTH_026',
  'OAUTH_027',
  ...Array.from({length: 17}, (_, i) => `OAUTH_0${29 + i}`)
])

export type ClickUpRequestAuth = Pick<TeamMemberIntegrationAuth, 'accessToken'> &
  Partial<Pick<TeamMemberIntegrationAuth, 'userId' | 'teamId' | 'providerId' | 'providerUserId'>>

export class ClickUpNotFoundError extends Error {}

type ClickUpQuery = Record<string, string | number | boolean | Array<string | number> | undefined>

interface ClickUpRequestInit {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  query?: ClickUpQuery
  body?: JsonObject
  workspaceId?: string
}

const buildUrl = (path: string, query: ClickUpQuery) => {
  const url = new URL(`${CLICKUP_API_URL}${path}`)
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined) return
    if (Array.isArray(value)) {
      value.forEach((item) => url.searchParams.append(`${key}[]`, String(item)))
    } else {
      url.searchParams.append(key, String(value))
    }
  })
  return url.toString()
}

const unsharedWorkspaceError = (path: string, {query = {}, workspaceId}: ClickUpRequestInit) => {
  const namedId = workspaceId ?? /^\/team\/(\d+)/.exec(path)?.[1] ?? query.team_id
  const workspace =
    typeof namedId === 'string' || typeof namedId === 'number'
      ? `ClickUp workspace ${namedId}`
      : 'This ClickUp workspace'
  return new Error(`${workspace} is not shared with Parabol. Reconnect ClickUp and select it`)
}

const clickUpRequest = async <T>(
  auth: ClickUpRequestAuth,
  path: string,
  init: ClickUpRequestInit = {}
): Promise<T | Error> => {
  const {method = 'GET', query = {}, body} = init
  const url = buildUrl(path, query)
  const signal = AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal
    })
    if (res.status === 429) {
      await res.body?.cancel()
      return new Error('ClickUp rate limit reached, try again in a minute')
    }
    const contentType = res.headers.get('content-type') ?? ''
    if (!contentType.toLowerCase().startsWith('application/json')) {
      const response = await readThirdPartyResponse('clickup', res, {method, url})
      return new ThirdPartyResponseError(
        `ClickUp returned an unexpected response (${res.status})`,
        response
      )
    }
    const json: unknown = await res.json()
    if (res.ok) return json as T
    const {err, error, ECODE = ''} = (json ?? {}) as ClickUpApiError
    if (res.status === 401 && REVOKED_GRANT_CODES.has(ECODE)) {
      const {userId, teamId, providerId, providerUserId = null} = auth
      if (userId && teamId && providerId) {
        await deactivateTeamMemberIntegrationAuthFamily({
          userId,
          teamId,
          providerId,
          providerUserId
        })
      }
      return new Error('Reconnect ClickUp: access was revoked')
    }
    if (UNSHARED_WORKSPACE_CODES.has(ECODE)) return unsharedWorkspaceError(path, init)
    const message = `ClickUp: ${err || error || `request failed (${res.status})`}`
    return res.status === 404 ? new ClickUpNotFoundError(message) : new Error(message)
  } catch (e) {
    if (signal.aborted) return new Error('ClickUp did not respond in time')
    return e instanceof Error ? e : new Error('ClickUp could not be reached')
  }
}

export default clickUpRequest
