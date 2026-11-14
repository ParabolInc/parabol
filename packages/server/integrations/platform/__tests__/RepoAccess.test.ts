import RepoAccess from '../RepoAccess'

const webProject = {id: 'dev.azure.com/acme:web-project', name: 'Web'}
const apiProject = {id: 'dev.azure.com/acme:api-project', name: 'Api'}

describe('RepoAccess.fromMeta', () => {
  it.each([
    ['null', null],
    ['undefined', undefined],
    ['a string', 'all'],
    ['an array', [webProject]],
    ['an object without repoAccess', {repos: [webProject]}],
    ['selected without repos', {repoAccess: 'selected'}],
    ['selected with repos that are not a list', {repoAccess: 'selected', repos: webProject}]
  ])('reads %s as a connection that shares nothing', (_label, meta) => {
    const access = RepoAccess.fromMeta(meta)
    expect(access.mode).toBe('selected')
    expect(access.repos).toEqual([])
    expect(access.allows(webProject.id)).toBe(false)
  })

  it('reads all as reaching every repo, ignoring a leftover list', () => {
    const access = RepoAccess.fromMeta({repoAccess: 'all', repos: [webProject]})
    expect(access.mode).toBe('all')
    expect(access.repos).toEqual([])
    expect(access.allows('dev.azure.com/other:anything')).toBe(true)
  })

  it('reads selected as reaching only the listed repos', () => {
    const access = RepoAccess.fromMeta({repoAccess: 'selected', repos: [webProject, apiProject]})
    expect(access.mode).toBe('selected')
    expect(access.repos).toEqual([webProject, apiProject])
    expect(access.allows(webProject.id)).toBe(true)
    expect(access.allows('dev.azure.com/acme:billing-project')).toBe(false)
  })

  it('drops malformed grants and keeps the well-formed ones', () => {
    const access = RepoAccess.fromMeta({
      repoAccess: 'selected',
      repos: [
        webProject,
        null,
        'dev.azure.com/acme:string-grant',
        {id: 'dev.azure.com/acme:nameless'},
        {name: 'No id'},
        {id: 7, name: 'Numeric id'},
        {id: 'dev.azure.com/acme:numeric-name', name: 7}
      ]
    })
    expect(access.repos).toEqual([webProject])
    expect(access.allows('dev.azure.com/acme:nameless')).toBe(false)
    expect(access.allows('dev.azure.com/acme:numeric-name')).toBe(false)
  })

  it('does not widen an unrecognized mode to all', () => {
    const access = RepoAccess.fromMeta({repoAccess: 'everything', repos: [webProject]})
    expect(access.mode).toBe('selected')
    expect(access.allows(webProject.id)).toBe(true)
    expect(access.allows(apiProject.id)).toBe(false)
  })
})

describe('RepoAccess.allows', () => {
  it('compares ids without regard to case', () => {
    const access = new RepoAccess('selected', [{id: 'dev.azure.com/Acme:Web-Project', name: 'Web'}])
    expect(access.allows('dev.azure.com/acme:web-project')).toBe(true)
    expect(access.allows('DEV.AZURE.COM/ACME:WEB-PROJECT')).toBe(true)
  })

  it('does not match on a prefix of a granted id', () => {
    const access = new RepoAccess('selected', [webProject])
    expect(access.allows('dev.azure.com/acme:web')).toBe(false)
    expect(access.allows('')).toBe(false)
  })
})

describe('RepoAccess.toMeta', () => {
  it('stores all without a repo list', () => {
    expect(new RepoAccess('all', [webProject]).toMeta()).toEqual({repoAccess: 'all'})
  })

  it('stores selected with its grants, even when there are none', () => {
    expect(new RepoAccess('selected', []).toMeta()).toEqual({repoAccess: 'selected', repos: []})
    expect(new RepoAccess('selected', [webProject]).toMeta()).toEqual({
      repoAccess: 'selected',
      repos: [webProject]
    })
  })

  it.each([
    ['all', new RepoAccess('all', [])],
    ['selected', new RepoAccess('selected', [webProject, apiProject])],
    ['selected with nothing', new RepoAccess('selected', [])]
  ])('round-trips %s through the stored JSON', (_label, access) => {
    const restored = RepoAccess.fromMeta(JSON.parse(JSON.stringify(access.toMeta())))
    expect(restored.mode).toBe(access.mode)
    expect(restored.repos).toEqual(access.repos)
    expect(restored.toMeta()).toEqual(access.toMeta())
  })
})
