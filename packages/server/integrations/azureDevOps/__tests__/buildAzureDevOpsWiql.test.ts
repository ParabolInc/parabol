import {AZURE_DEVOPS_IS_WORK} from 'parabol-client/shared/integrations/buildAzureDevOpsWorkWiql'
import {buildAzureDevOpsSearchWiql, toWiqlQuery} from '../buildAzureDevOpsWiql'

const IS_OPEN = "[System.State] NOT IN ('Closed', 'Done', 'Removed')"
const OPEN_WORK = `${AZURE_DEVOPS_IS_WORK} AND ${IS_OPEN}`

const UNBALANCED_MESSAGE = 'That WIQL has unbalanced parentheses, brackets or quotes'

const plainSearch = (queryString: string) => {
  const search = buildAzureDevOpsSearchWiql(queryString, false)
  if (search instanceof Error) throw search
  return search
}

describe('buildAzureDevOpsSearchWiql', () => {
  it('matches a plain search against the title of open work', () => {
    expect(buildAzureDevOpsSearchWiql('login bug', false)).toEqual({
      where: `[System.Title] CONTAINS 'login bug' AND ${OPEN_WORK}`,
      orderBy: undefined
    })
  })

  it('trims a plain search and escapes its quotes', () => {
    expect(plainSearch("  can't log in ").where).toBe(
      `[System.Title] CONTAINS 'can''t log in' AND ${OPEN_WORK}`
    )
  })

  it('treats WIQL syntax typed into a plain search as title text', () => {
    const {where, orderBy} = plainSearch('fix order by clause')
    expect(where).toBe(`[System.Title] CONTAINS 'fix order by clause' AND ${OPEN_WORK}`)
    expect(orderBy).toBeUndefined()
  })

  it('never rejects a plain search for its quotes or parentheses', () => {
    expect(plainSearch('it\'s (still "broken').where).toBe(
      `[System.Title] CONTAINS 'it''s (still "broken' AND ${OPEN_WORK}`
    )
  })

  it.each([
    ['123', '123'],
    ['#123', '123'],
    ['  #7 ', '7']
  ])('also matches %s by work item id', (queryString, workItemId) => {
    const title = queryString.trim()
    expect(plainSearch(queryString).where).toBe(
      `[System.Id] = ${workItemId} OR ([System.Title] CONTAINS '${title}' AND ${OPEN_WORK})`
    )
  })

  it.each(['12a', '#', '# 12', '1234567890', '12 34'])(
    'does not read %s as a work item id',
    (queryString) => {
      expect(plainSearch(queryString).where).not.toContain('[System.Id]')
    }
  )

  it.each([
    ['null', null, false],
    ['an empty string', '', false],
    ['whitespace', '   ', false],
    ['an empty WIQL search', ' ', true]
  ])('lists open work for %s', (_label, queryString, isWIQL) => {
    expect(buildAzureDevOpsSearchWiql(queryString, isWIQL)).toEqual({
      where: OPEN_WORK,
      orderBy: undefined
    })
  })

  it('passes an advanced WIQL clause through untouched', () => {
    const clause = "[System.State] = 'Active' AND [System.AssignedTo] = @Me"
    expect(buildAzureDevOpsSearchWiql(` ${clause} `, true)).toEqual({
      where: clause,
      orderBy: undefined
    })
  })

  it('splits the ordering off an advanced WIQL clause', () => {
    expect(
      buildAzureDevOpsSearchWiql("[System.State] = 'Active' order by [System.Id]", true)
    ).toEqual({
      where: "[System.State] = 'Active'",
      orderBy: 'order by [System.Id]'
    })
  })

  it('reduces a pasted SELECT to its WHERE clause and carries the ORDER BY', () => {
    const pasted = `SELECT [System.Id], [System.Title]
      FROM WorkItems
      WHERE [System.TeamProject] = 'Web' AND [System.State] = 'Active'
      ORDER BY [Microsoft.VSTS.Common.Priority] ASC, [System.CreatedDate] DESC`
    expect(buildAzureDevOpsSearchWiql(pasted, true)).toEqual({
      where: "[System.TeamProject] = 'Web' AND [System.State] = 'Active'",
      orderBy: 'ORDER BY [Microsoft.VSTS.Common.Priority] ASC, [System.CreatedDate] DESC'
    })
  })

  it('falls back to open work when advanced WIQL is only an ordering', () => {
    expect(buildAzureDevOpsSearchWiql('ORDER BY [System.Id] DESC', true)).toEqual({
      where: OPEN_WORK,
      orderBy: 'ORDER BY [System.Id] DESC'
    })
  })

  it.each([
    'SELECT [System.Id], [System.Title] FROM WorkItems',
    'select [System.Id] from WorkItems where  '
  ])('falls back to open work for a pasted %j, which has no conditions', (pasted) => {
    expect(buildAzureDevOpsSearchWiql(pasted, true)).toEqual({
      where: OPEN_WORK,
      orderBy: undefined
    })
  })

  it.each([
    ['inside a string literal', "[System.Title] CONTAINS 'sort order by priority'"],
    ['inside a double-quoted literal', '[System.Title] CONTAINS "order by"'],
    ['inside parentheses', "([System.Title] CONTAINS 'x' order by [System.Id])"]
  ])('leaves an ORDER BY %s in the clause', (_label, clause) => {
    expect(buildAzureDevOpsSearchWiql(clause, true)).toEqual({where: clause, orderBy: undefined})
  })

  it('splits only the top-level ORDER BY that follows a literal containing one', () => {
    expect(
      buildAzureDevOpsSearchWiql(
        "[System.Title] CONTAINS 'order by' ORDER BY [System.Id] DESC",
        true
      )
    ).toEqual({
      where: "[System.Title] CONTAINS 'order by'",
      orderBy: 'ORDER BY [System.Id] DESC'
    })
  })

  it.each([
    ['a closing parenthesis that escapes the project pin', '1 = 1) OR ([System.Id] > 0'],
    ['an unclosed parenthesis', "([System.State] = 'Active'"],
    ['a stray closing parenthesis', "[System.State] = 'Active')"],
    ['an unclosed single quote', "[System.Title] CONTAINS 'login"],
    ['an unclosed double quote', '[System.Title] CONTAINS "login'],
    [
      'an unbalanced clause inside a pasted SELECT',
      'SELECT [System.Id] FROM WorkItems WHERE 1 = 1) OR ([System.Id] > 0'
    ],
    ['an unbalanced ordering', "[System.State] = 'Active' ORDER BY [System.Id])"]
  ])('rejects %s', (_label, clause) => {
    const search = buildAzureDevOpsSearchWiql(clause, true)
    expect(search).toBeInstanceOf(Error)
    expect(search).toHaveProperty('message', UNBALANCED_MESSAGE)
  })

  it.each([
    ['parentheses inside a string literal', "[System.Title] CONTAINS ':)' OR [System.Id] = 1"],
    ['an unclosed parenthesis inside a string literal', "[System.Title] CONTAINS '(draft'"],
    ['a doubled quote inside a string literal', "[System.Title] CONTAINS 'can''t (log in'"],
    ['an apostrophe inside a double-quoted literal', '[System.Title] CONTAINS "can\'t"'],
    ['balanced nested parentheses', '([System.Id] = 1 OR ([System.Id] = 2 AND [System.Rev] > 1))']
  ])('accepts %s', (_label, clause) => {
    expect(buildAzureDevOpsSearchWiql(clause, true)).toEqual({where: clause, orderBy: undefined})
  })
})

describe('toWiqlQuery', () => {
  it('pins a project-scoped query to its project', () => {
    expect(toWiqlQuery("[System.State] = 'Active'", true)).toBe(
      "SELECT [System.Id] FROM WorkItems WHERE ([System.State] = 'Active') AND [System.TeamProject] = @project ORDER BY [System.ChangedDate] DESC"
    )
  })

  it('leaves @project out of an organization-wide query', () => {
    expect(toWiqlQuery("[System.State] = 'Active'", false)).toBe(
      "SELECT [System.Id] FROM WorkItems WHERE ([System.State] = 'Active') ORDER BY [System.ChangedDate] DESC"
    )
  })

  it('parenthesizes the clause so an OR cannot widen the project pin', () => {
    expect(toWiqlQuery('[System.Id] = 1 OR [System.Id] = 2', true)).toContain(
      'WHERE ([System.Id] = 1 OR [System.Id] = 2) AND [System.TeamProject] = @project'
    )
  })

  it('uses the ordering it is given', () => {
    expect(toWiqlQuery('[System.Id] = 1', true, 'ORDER BY [System.Id] ASC')).toBe(
      'SELECT [System.Id] FROM WorkItems WHERE ([System.Id] = 1) AND [System.TeamProject] = @project ORDER BY [System.Id] ASC'
    )
  })
})

describe('buildAzureDevOpsSearchWiql with [bracketed] field names', () => {
  it('rejects a clause that hides an unbalanced parenthesis behind a quote in a field name', () => {
    expect(
      buildAzureDevOpsSearchWiql("[it's] = 1) OR ([System.Id] > 0 OR [x'y] = 1", true)
    ).toBeInstanceOf(Error)
  })

  it('keeps a field name that contains the words order by', () => {
    expect(buildAzureDevOpsSearchWiql('[Order By Rank] > 1', true)).toEqual({
      where: '[Order By Rank] > 1',
      orderBy: undefined
    })
  })

  it('finds the WHERE of a pasted query past a column named like the keyword', () => {
    expect(
      buildAzureDevOpsSearchWiql(
        "SELECT [Custom.Where] FROM WorkItems WHERE [System.State] = 'Active'",
        true
      )
    ).toEqual({where: "[System.State] = 'Active'", orderBy: undefined})
  })

  it('keeps the ordering of a pasted query that has no WHERE', () => {
    expect(
      buildAzureDevOpsSearchWiql(
        'SELECT [System.Id] FROM WorkItems ORDER BY [System.CreatedDate] DESC',
        true
      )
    ).toMatchObject({orderBy: 'ORDER BY [System.CreatedDate] DESC'})
  })

  it('rejects an unclosed field name', () => {
    expect(buildAzureDevOpsSearchWiql('[System.Id > 0', true)).toBeInstanceOf(Error)
  })
})
