import {
  type InspirationIssue,
  MAX_ISSUES
} from '../../../../../integrations/platform/InspirationIssue'
import pageInspirationIssues from '../pageInspirationIssues'

const issue = (title: string, updatedAt: string | null): InspirationIssue => ({
  kind: 'Issue',
  title,
  reference: title,
  url: '',
  updatedAt: updatedAt ? new Date(updatedAt) : null,
  description: null
})

// A full page of one issue a day, newest first, ending on the given day of November
const fullPage = (prefix: string, oldestDay: number) =>
  Array.from({length: MAX_ISSUES}, (_, idx) => {
    const day = oldestDay + MAX_ISSUES - 1 - idx
    return issue(`${prefix}${day}`, `2026-11-${String(day).padStart(2, '0')}T12:00:00Z`)
  })

const titlesOf = (sources: {sourceIssues: InspirationIssue[]}[]) =>
  sources.map(({sourceIssues}) => sourceIssues.map(({title}) => title))

describe('pageInspirationIssues', () => {
  it('keeps everything and ends the timeline when no source filled its page', () => {
    const sources = [
      {service: 'github', sourceIssues: [issue('a', '2026-11-10T00:00:00Z')]},
      {service: 'jira', sourceIssues: [issue('b', '2026-11-02T00:00:00Z')]}
    ]
    const {nextBefore, pagedSources} = pageInspirationIssues(sources, null)
    expect(nextBefore).toBeNull()
    expect(titlesOf(pagedSources)).toEqual([['a'], ['b']])
  })

  it('reaches only down to the oldest issue of a full source, holding older issues of other sources back', () => {
    const github = fullPage('g', 5)
    const sources = [
      {service: 'github', sourceIssues: github},
      {
        service: 'jira',
        sourceIssues: [
          issue('newer', '2026-11-06T00:00:00Z'),
          issue('older', '2026-11-02T00:00:00Z')
        ]
      }
    ]
    const {nextBefore, pagedSources} = pageInspirationIssues(sources, null)
    expect(nextBefore).toEqual(new Date('2026-11-05T12:00:00Z'))
    expect(pagedSources[0]!.sourceIssues).toHaveLength(MAX_ISSUES)
    expect(titlesOf(pagedSources)[1]).toEqual(['newer'])
  })

  it('reaches down to the later of two full sources', () => {
    const {nextBefore, pagedSources} = pageInspirationIssues(
      [
        {service: 'github', sourceIssues: fullPage('g', 5)},
        {service: 'jira', sourceIssues: fullPage('j', 2)}
      ],
      null
    )
    expect(nextBefore).toEqual(new Date('2026-11-05T12:00:00Z'))
    expect(pagedSources[1]!.sourceIssues.at(-1)!.title).toBe('j5')
  })

  it('drops what the newer page showed and keeps undated issues for the first page', () => {
    const sources = [
      {
        service: 'gcal',
        sourceIssues: [
          issue('shown', '2026-11-08T00:00:00Z'),
          issue('boundary', '2026-11-07T00:00:00Z'),
          issue('next', '2026-11-06T00:00:00Z'),
          issue('undated', null)
        ]
      }
    ]
    const before = new Date('2026-11-07T00:00:00Z')
    expect(titlesOf(pageInspirationIssues(sources, before).pagedSources)).toEqual([['next']])
    expect(titlesOf(pageInspirationIssues(sources, null).pagedSources)).toEqual([
      ['shown', 'boundary', 'next', 'undated']
    ])
  })

  it('does not let a full source stuck on before hold the page back', () => {
    const before = new Date('2026-11-01T00:00:00Z')
    const {nextBefore} = pageInspirationIssues(
      [{service: 'jira', sourceIssues: fullPage('j', 1)}],
      before
    )
    expect(nextBefore).toBeNull()
  })
})
