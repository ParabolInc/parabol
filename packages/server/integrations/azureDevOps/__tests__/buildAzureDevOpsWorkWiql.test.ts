import buildAzureDevOpsWorkWiql, {
  AZURE_DEVOPS_IS_WORK,
  type AzureDevOpsWorkKind,
  quoteWiql
} from 'parabol-client/shared/integrations/buildAzureDevOpsWorkWiql'
import {buildAzureDevOpsSearchWiql} from '../buildAzureDevOpsWiql'

const START_AT = '2026-10-01T07:30:00.000Z'
const END_AT = '2026-10-07T23:59:59.999Z'
const CHANGED_SINCE = `[System.ChangedDate] >= '${START_AT}'`
const CHANGED_UNTIL = `[System.ChangedDate] <= '${END_AT}'`
const ASSIGNED_OR_CREATED = '([System.AssignedTo] = @Me OR [System.CreatedBy] = @Me)'
const BOTH_KINDS: AzureDevOpsWorkKind[] = ['assigned', 'created']

describe('quoteWiql', () => {
  it('wraps a value in single quotes', () => {
    expect(quoteWiql('login')).toBe("'login'")
  })

  it('doubles every single quote so the value cannot close its literal', () => {
    expect(quoteWiql("O'Brien's")).toBe("'O''Brien''s'")
    expect(quoteWiql("' OR [System.Id] > 0 OR '' = '")).toBe("''' OR [System.Id] > 0 OR '''' = '''")
  })
})

describe('AZURE_DEVOPS_IS_WORK', () => {
  it('leaves out the test, review and feedback work item types', () => {
    expect(AZURE_DEVOPS_IS_WORK).toBe(
      "[System.WorkItemType] NOT IN ('Test Case', 'Test Plan', 'Test Suite', 'Shared Steps', 'Shared Parameter', 'Code Review Request', 'Code Review Response', 'Feedback Request', 'Feedback Response')"
    )
  })
})

describe('buildAzureDevOpsWorkWiql', () => {
  const kindCases: [string, AzureDevOpsWorkKind[], string][] = [
    ['assigned work', ['assigned'], '([System.AssignedTo] = @Me)'],
    ['created work', ['created'], '([System.CreatedBy] = @Me)'],
    ['assigned or created work', ['created', 'assigned'], ASSIGNED_OR_CREATED]
  ]

  it.each(kindCases)('finds %s changed inside the date window', (_label, kinds, people) => {
    expect(buildAzureDevOpsWorkWiql({kinds, startAt: START_AT, endAt: END_AT})).toBe(
      `${people} AND ${AZURE_DEVOPS_IS_WORK} AND ${CHANGED_SINCE} AND ${CHANGED_UNTIL}`
    )
  })

  it('leaves the window open at the end when there is no endAt', () => {
    expect(buildAzureDevOpsWorkWiql({kinds: BOTH_KINDS, startAt: START_AT})).toBe(
      `${ASSIGNED_OR_CREATED} AND ${AZURE_DEVOPS_IS_WORK} AND ${CHANGED_SINCE}`
    )
  })

  it('leaves the window open at the start when there is no startAt', () => {
    expect(buildAzureDevOpsWorkWiql({kinds: BOTH_KINDS, endAt: END_AT})).toBe(
      `${ASSIGNED_OR_CREATED} AND ${AZURE_DEVOPS_IS_WORK} AND ${CHANGED_UNTIL}`
    )
  })

  it('has no date bound when neither date is given', () => {
    expect(buildAzureDevOpsWorkWiql({kinds: BOTH_KINDS})).toBe(
      `${ASSIGNED_OR_CREATED} AND ${AZURE_DEVOPS_IS_WORK}`
    )
  })

  it('has no people clause when no kind is given', () => {
    expect(buildAzureDevOpsWorkWiql({kinds: [], startAt: START_AT, endAt: END_AT})).toBe(
      `${AZURE_DEVOPS_IS_WORK} AND ${CHANGED_SINCE} AND ${CHANGED_UNTIL}`
    )
    expect(buildAzureDevOpsWorkWiql({kinds: []})).toBe(AZURE_DEVOPS_IS_WORK)
  })

  it('quotes the dates so one cannot close its literal', () => {
    expect(
      buildAzureDevOpsWorkWiql({
        kinds: ['assigned'],
        startAt: "2026-10-01' OR [System.Id] > 0 OR '"
      })
    ).toBe(
      `([System.AssignedTo] = @Me) AND ${AZURE_DEVOPS_IS_WORK} AND [System.ChangedDate] >= '2026-10-01'' OR [System.Id] > 0 OR '''`
    )
  })

  const filterCases: [string, {kinds: AzureDevOpsWorkKind[]; startAt?: string; endAt?: string}][] =
    [
      ['both dates', {kinds: BOTH_KINDS, startAt: START_AT, endAt: END_AT}],
      ['one date', {kinds: ['assigned'], startAt: START_AT}],
      ['no dates', {kinds: ['created']}],
      ['no kinds', {kinds: [], endAt: END_AT}]
    ]

  it.each(filterCases)(
    'survives the server’s WIQL search scan unchanged with %s, so the list matches the draft',
    (_label, filter) => {
      const where = buildAzureDevOpsWorkWiql(filter)
      expect(buildAzureDevOpsSearchWiql(where, true)).toEqual({where, orderBy: undefined})
    }
  )
})
