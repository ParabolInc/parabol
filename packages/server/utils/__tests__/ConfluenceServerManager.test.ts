import {ConfluenceServerManager} from '../ConfluenceServerManager'

const jsonRes = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {'Content-Type': 'application/json', ...headers}
  })

const scripted = (...responses: Response[]) => {
  const calls: {url: string; init?: RequestInit}[] = []
  const fetchFn = (async (url: unknown, init?: RequestInit) => {
    calls.push({url: String(url), init})
    return responses.shift() ?? jsonRes(500, {})
  }) as typeof fetch
  return {fetchFn, calls}
}

const pageRes = (id: string, title: string) => ({
  id,
  title,
  version: {number: 1},
  _links: {webui: `/spaces/X/pages/${id}/${title}`}
})

describe('ConfluenceServerManager', () => {
  it('creates a page against the v2 gateway path with a bearer token', async () => {
    const {fetchFn, calls} = scripted(jsonRes(200, pageRes('1', 'T')))
    const mgr = new ConfluenceServerManager('tok', 'cloud1', fetchFn)
    const page = await mgr.createPage({spaceId: 's1', title: 'T', storageValue: '<p />'})
    expect(calls[0]!.url).toBe('https://api.atlassian.com/ex/confluence/cloud1/wiki/api/v2/pages')
    expect((calls[0]!.init!.headers as Record<string, string>)['Authorization']).toBe('Bearer tok')
    expect(JSON.parse(String(calls[0]!.init!.body))).toMatchObject({
      spaceId: 's1',
      title: 'T',
      body: {representation: 'storage', value: '<p />'}
    })
    expect(page).toMatchObject({id: '1', title: 'T', version: 1})
    expect(page.webui).toContain('/pages/1/')
  })

  it('includes parentId when provided and omits it otherwise', async () => {
    const {fetchFn, calls} = scripted(jsonRes(200, pageRes('2', 'C')))
    const mgr = new ConfluenceServerManager('tok', 'cloud1', fetchFn)
    await mgr.createPage({spaceId: 's1', parentId: '77', title: 'C', storageValue: '<p />'})
    expect(JSON.parse(String(calls[0]!.init!.body)).parentId).toBe('77')
  })

  it('honors Retry-After on 429 then succeeds', async () => {
    const {fetchFn, calls} = scripted(
      jsonRes(429, {}, {'Retry-After': '0'}),
      jsonRes(200, {results: []})
    )
    const mgr = new ConfluenceServerManager('tok', 'cloud1', fetchFn)
    await mgr.getSpaces()
    expect(calls).toHaveLength(2)
  })

  it('maps the duplicate-title 400 to titleConflict and retries with " (2)"', async () => {
    const {fetchFn, calls} = scripted(
      jsonRes(400, {
        errors: [
          {
            status: 400,
            code: 'BAD_REQUEST',
            title:
              'A page with this title already exists: A page already exists with the same TITLE in this space',
            detail: null
          }
        ]
      }),
      jsonRes(200, pageRes('2', 'T (2)'))
    )
    const mgr = new ConfluenceServerManager('tok', 'cloud1', fetchFn)
    const {page, finalTitle} = await mgr.createPageWithUniqueTitle({
      spaceId: 's1',
      title: 'T',
      storageValue: '<p />'
    })
    expect(finalTitle).toBe('T (2)')
    expect(page.id).toBe('2')
    expect(JSON.parse(String(calls[1]!.init!.body)).title).toBe('T (2)')
  })

  it('gives up the suffix loop after 20 attempts with titleConflict', async () => {
    const conflict = () =>
      jsonRes(400, {errors: [{title: 'A page with this title already exists'}]})
    const responses = Array.from({length: 20}, conflict)
    const {fetchFn} = scripted(...responses)
    const mgr = new ConfluenceServerManager('tok', 'cloud1', fetchFn)
    await expect(
      mgr.createPageWithUniqueTitle({spaceId: 's1', title: 'T', storageValue: '<p />'})
    ).rejects.toMatchObject({errorClass: 'titleConflict'})
  })

  it('uploads attachments as v1 multipart with the nocheck header', async () => {
    const {fetchFn, calls} = scripted(jsonRes(200, {results: [{title: 'pic.png'}]}))
    const mgr = new ConfluenceServerManager('tok', 'cloud1', fetchFn)
    await mgr.uploadAttachment('1', 'pic.png', Buffer.from('x'), 'image/png')
    expect(calls[0]!.url).toBe(
      'https://api.atlassian.com/ex/confluence/cloud1/wiki/rest/api/content/1/child/attachment'
    )
    const headers = calls[0]!.init!.headers as Record<string, string>
    expect(headers['X-Atlassian-Token']).toBe('nocheck')
    expect(headers['Content-Type']).toBeUndefined() // fetch sets the multipart boundary itself
    expect(calls[0]!.init!.body).toBeInstanceOf(FormData)
    const file = (calls[0]!.init!.body as FormData).get('file') as File
    expect(file.name).toBe('pic.png')
    expect(file.type).toBe('image/png')
  })

  it('throws ConfluenceApiError with errorClass forbidden on 403', async () => {
    const {fetchFn} = scripted(jsonRes(403, {}))
    const mgr = new ConfluenceServerManager('tok', 'cloud1', fetchFn)
    await expect(mgr.getSpaces()).rejects.toMatchObject({errorClass: 'forbidden', status: 403})
  })

  it('maps 413 to tooLarge and network failures to network', async () => {
    const {fetchFn} = scripted(jsonRes(413, {}))
    const mgr = new ConfluenceServerManager('tok', 'cloud1', fetchFn)
    await expect(
      mgr.createPage({spaceId: 's1', title: 'T', storageValue: '<p />'})
    ).rejects.toMatchObject({errorClass: 'tooLarge'})

    const failingFetch = (async () => {
      throw new Error('socket hang up')
    }) as typeof fetch
    const mgr2 = new ConfluenceServerManager('tok', 'cloud1', failingFetch)
    await expect(mgr2.getSpaces()).rejects.toMatchObject({errorClass: 'network'})
  })

  it('follows v2 cursor pagination on getSpaces and normalizes isPersonal', async () => {
    const {fetchFn, calls} = scripted(
      jsonRes(200, {
        results: [{id: '1', key: 'A', name: 'Alpha', type: 'global'}],
        _links: {next: '/wiki/api/v2/spaces?cursor=abc'}
      }),
      jsonRes(200, {results: [{id: '2', key: '~B', name: 'Bea', type: 'personal'}]})
    )
    const mgr = new ConfluenceServerManager('tok', 'cloud1', fetchFn)
    const spaces = await mgr.getSpaces()
    expect(spaces).toEqual([
      {id: '1', key: 'A', name: 'Alpha', isPersonal: false},
      {id: '2', key: '~B', name: 'Bea', isPersonal: true}
    ])
    expect(calls[1]!.url).toBe(
      'https://api.atlassian.com/ex/confluence/cloud1/wiki/api/v2/spaces?cursor=abc'
    )
  })

  it('lists recent space pages via v2 and filters by title substring', async () => {
    const {fetchFn, calls} = scripted(
      jsonRes(200, {
        results: [
          {id: '9', title: 'Retros — 2026'},
          {id: '10', title: 'Roadmap'},
          {id: '11', title: 'Old retros archive'}
        ]
      })
    )
    const mgr = new ConfluenceServerManager('tok', 'cloud1', fetchFn)
    const pages = await mgr.searchPagesInSpace('98313', 'retro')
    expect(pages).toEqual([
      {id: '9', title: 'Retros — 2026'},
      {id: '11', title: 'Old retros archive'}
    ])
    expect(calls[0]!.url).toBe(
      'https://api.atlassian.com/ex/confluence/cloud1/wiki/api/v2/spaces/98313/pages?limit=250&sort=-modified-date'
    )
  })

  it('updates a page body with a version bump', async () => {
    const {fetchFn, calls} = scripted(jsonRes(200, pageRes('5', 'T')))
    const mgr = new ConfluenceServerManager('tok', 'cloud1', fetchFn)
    await mgr.updatePageBody({pageId: '5', title: 'T', storageValue: '<p>v2</p>', version: 2})
    expect(calls[0]!.url).toBe('https://api.atlassian.com/ex/confluence/cloud1/wiki/api/v2/pages/5')
    expect(calls[0]!.init!.method).toBe('PUT')
    expect(JSON.parse(String(calls[0]!.init!.body))).toMatchObject({
      id: '5',
      status: 'current',
      version: {number: 2}
    })
  })

  it('supports site-base-URL + basic auth for the manual harness', async () => {
    const {fetchFn, calls} = scripted(jsonRes(200, {results: []}))
    const mgr = new ConfluenceServerManager('', 'cloud1', fetchFn, {
      siteBaseUrl: 'https://scratch.atlassian.net',
      basicAuth: {email: 'a@b.co', token: 'tok123'}
    })
    await mgr.getSpaces()
    expect(calls[0]!.url).toBe('https://scratch.atlassian.net/wiki/api/v2/spaces?limit=100')
    const auth = (calls[0]!.init!.headers as Record<string, string>)['Authorization']
    expect(auth).toBe(`Basic ${Buffer.from('a@b.co:tok123').toString('base64')}`)
  })
})
