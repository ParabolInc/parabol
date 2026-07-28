import {fetch} from '@whatwg-node/fetch'

export type ConfluenceErrorClass =
  | 'tooLarge'
  | 'forbidden'
  | 'rateLimit'
  | 'titleConflict'
  | 'network'
  | 'unknown'

export class ConfluenceApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errorClass: ConfluenceErrorClass,
    public retryAfterSec?: number
  ) {
    super(message)
    this.name = 'ConfluenceApiError'
  }
}

export interface ConfluenceSpaceRes {
  id: string
  key: string
  name: string
  isPersonal: boolean
}

export interface ConfluencePageRes {
  id: string
  title: string
  version: number
  // site-relative web path (e.g. /spaces/KEY/pages/123/Title) — callers build absolute
  // URLs as `${siteUrl}/wiki${webui}`
  webui: string
}

interface ManagerOpts {
  // manual-harness escape hatch: hit the site host with basic auth instead of the
  // api.atlassian.com OAuth gateway (3LO bearer tokens only work through the gateway,
  // API tokens only against the site host)
  siteBaseUrl?: string
  basicAuth?: {email: string; token: string}
}

const MAX_TITLE_ATTEMPTS = 20
const RETRY_DEADLINE_MS = 60_000

const isTitleConflict = (status: number, body: unknown): boolean => {
  if (status !== 400 || !body || typeof body !== 'object') return false
  const errors = (body as {errors?: {title?: string}[]}).errors
  return !!errors?.some((e) => e.title?.toLowerCase().includes('title already exists'))
}

export class ConfluenceServerManager {
  private baseUrl: string
  private authHeader: string

  constructor(
    accessToken: string,
    cloudId: string,
    private fetchFn: typeof fetch = fetch,
    opts?: ManagerOpts
  ) {
    this.baseUrl = opts?.siteBaseUrl ?? `https://api.atlassian.com/ex/confluence/${cloudId}`
    this.authHeader = opts?.basicAuth
      ? `Basic ${Buffer.from(`${opts.basicAuth.email}:${opts.basicAuth.token}`).toString('base64')}`
      : `Bearer ${accessToken}`
  }

  private async request<T>(
    path: string,
    init: {
      method?: string
      json?: unknown
      formData?: FormData
      extraHeaders?: Record<string, string>
    } = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`
    const headers: Record<string, string> = {
      Authorization: this.authHeader,
      Accept: 'application/json',
      ...init.extraHeaders
    }
    let body: string | FormData | undefined
    if (init.formData) {
      body = init.formData // fetch sets the multipart boundary Content-Type itself
    } else if (init.json !== undefined) {
      headers['Content-Type'] = 'application/json'
      body = JSON.stringify(init.json)
    }

    const deadline = Date.now() + RETRY_DEADLINE_MS
    let attempt = 0
    while (true) {
      let res: Response
      try {
        res = await this.fetchFn(url, {method: init.method ?? 'GET', headers, body})
      } catch (e) {
        throw new ConfluenceApiError(0, e instanceof Error ? e.message : 'fetch failed', 'network')
      }
      if (res.status === 429 && Date.now() < deadline) {
        const retryAfterSec = Number(res.headers.get('Retry-After') ?? 2 ** attempt)
        await res.body?.cancel()
        const jitterMs = Math.random() * 1000
        await new Promise((resolve) => setTimeout(resolve, retryAfterSec * 1000 + jitterMs))
        attempt++
        continue
      }
      const resBody = await res.json().catch(() => null)
      if (res.ok) return resBody as T
      throw this.toApiError(res, resBody)
    }
  }

  private toApiError(res: Response, body: unknown): ConfluenceApiError {
    const message =
      (body as {errors?: {title?: string}[]})?.errors?.[0]?.title ??
      `Confluence request failed with status ${res.status}`
    if (isTitleConflict(res.status, body)) {
      return new ConfluenceApiError(res.status, message, 'titleConflict')
    }
    const errorClass: ConfluenceErrorClass =
      res.status === 413
        ? 'tooLarge'
        : res.status === 403
          ? 'forbidden'
          : res.status === 429
            ? 'rateLimit'
            : 'unknown'
    const retryAfter = res.headers.get('Retry-After')
    return new ConfluenceApiError(
      res.status,
      message,
      errorClass,
      retryAfter ? Number(retryAfter) : undefined
    )
  }

  async getSpaces(): Promise<ConfluenceSpaceRes[]> {
    const spaces: ConfluenceSpaceRes[] = []
    let path: string | null = '/wiki/api/v2/spaces?limit=100'
    while (path) {
      type SpacesPage = {
        results: {id: string; key: string; name: string; type: string}[]
        _links?: {next?: string}
      }
      const page: SpacesPage = await this.request<SpacesPage>(path)
      page.results.forEach(({id, key, name, type}) => {
        spaces.push({id, key, name, isPersonal: type === 'personal'})
      })
      path = page._links?.next ?? null
    }
    return spaces
  }

  // v1 CQL search requires the `search:confluence` scope, which is not offered in the
  // granular family — so list the space's most recently modified pages (read:page scope)
  // and filter by title substring instead
  async searchPagesInSpace(spaceId: string, query: string) {
    const res = await this.request<{results: {id: string; title: string}[]}>(
      `/wiki/api/v2/spaces/${spaceId}/pages?limit=250&sort=-modified-date`
    )
    const normalizedQuery = query.trim().toLowerCase()
    return res.results
      .filter(({title}) => !normalizedQuery || title.toLowerCase().includes(normalizedQuery))
      .slice(0, 15)
      .map(({id, title}) => ({id, title}))
  }

  async createPage(input: {
    spaceId: string
    parentId?: string
    title: string
    storageValue: string
  }): Promise<ConfluencePageRes> {
    const {spaceId, parentId, title, storageValue} = input
    const res = await this.request<{
      id: string
      title: string
      version: {number: number}
      _links?: {webui?: string}
    }>('/wiki/api/v2/pages', {
      method: 'POST',
      json: {
        spaceId,
        ...(parentId ? {parentId} : {}),
        title,
        body: {representation: 'storage', value: storageValue}
      }
    })
    return {
      id: res.id,
      title: res.title,
      version: res.version.number,
      webui: res._links?.webui ?? ''
    }
  }

  async createPageWithUniqueTitle(input: {
    spaceId: string
    parentId?: string
    title: string
    storageValue: string
  }): Promise<{page: ConfluencePageRes; finalTitle: string}> {
    for (let attempt = 0; attempt < MAX_TITLE_ATTEMPTS; attempt++) {
      const finalTitle = attempt === 0 ? input.title : `${input.title} (${attempt + 1})`
      try {
        const page = await this.createPage({...input, title: finalTitle})
        return {page, finalTitle}
      } catch (e) {
        if (e instanceof ConfluenceApiError && e.errorClass === 'titleConflict') continue
        throw e
      }
    }
    throw new ConfluenceApiError(
      400,
      `Could not find a unique title for "${input.title}" after ${MAX_TITLE_ATTEMPTS} attempts`,
      'titleConflict'
    )
  }

  async updatePageBody(input: {
    pageId: string
    title: string
    storageValue: string
    version: number
  }): Promise<void> {
    const {pageId, title, storageValue, version} = input
    await this.request(`/wiki/api/v2/pages/${pageId}`, {
      method: 'PUT',
      json: {
        id: pageId,
        status: 'current',
        title,
        body: {representation: 'storage', value: storageValue},
        version: {number: version}
      }
    })
  }

  async uploadAttachment(
    pageId: string,
    filename: string,
    buffer: Buffer,
    mimeType: string
  ): Promise<void> {
    const formData = new FormData()
    formData.append('file', new File([new Uint8Array(buffer)], filename, {type: mimeType}))
    await this.request(`/wiki/rest/api/content/${pageId}/child/attachment`, {
      method: 'POST',
      formData,
      extraHeaders: {'X-Atlassian-Token': 'nocheck'}
    })
  }
}
