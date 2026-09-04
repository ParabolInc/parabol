import dayjs from 'dayjs'
import {
  browseLabel,
  browseSubline,
  formatSince,
  itemSource,
  metaLine,
  serviceLabel
} from '../inspirationCopy'

describe('formatSince', () => {
  it('returns recently when no start time is given', () => {
    expect(formatSince(undefined)).toBe('recently')
  })

  it('returns yesterday within the last 36 hours', () => {
    const startAt = dayjs().subtract(20, 'hour').toISOString()
    expect(formatSince(startAt)).toBe('yesterday')
  })

  it('returns a formatted date beyond 36 hours', () => {
    const startAt = dayjs().subtract(72, 'hour')
    expect(formatSince(startAt.toISOString())).toBe(startAt.format('MMM D'))
  })
})

describe('metaLine', () => {
  it('uses singular question copy when promptCount is 1', () => {
    expect(metaLine(5, 'yesterday', 1)).toBe(
      'Drafted from 5 work items since yesterday · routed to your question'
    )
  })

  it('uses plural questions copy when promptCount is greater than 1', () => {
    expect(metaLine(5, 'yesterday', 3)).toBe(
      'Drafted from 5 work items since yesterday · routed to your 3 questions'
    )
  })

  it('falls back to your work when workItemCount is unknown', () => {
    expect(metaLine(undefined, 'yesterday', 2)).toBe(
      'Drafted from your work since yesterday · routed to your 2 questions'
    )
  })
})

describe('browseLabel', () => {
  it('includes the count when known', () => {
    expect(browseLabel(12)).toBe('Browse all 12 work items')
  })

  it('falls back to a generic label when unknown', () => {
    expect(browseLabel(undefined)).toBe('Browse work items')
  })
})

describe('browseSubline', () => {
  it('formats the date range when given', () => {
    const dateRange = {
      startAt: '2026-08-20T00:00:00.000Z',
      endAt: '2026-08-27T00:00:00.000Z'
    }
    expect(browseSubline(dateRange)).toBe(
      `Tasks, PRs and issues from ${dayjs(dateRange.startAt).format('MMM D')} – ${dayjs(
        dateRange.endAt
      ).format('MMM D')} · filter by status or source`
    )
  })

  it('falls back to a generic subline when no date range is given', () => {
    expect(browseSubline(undefined)).toBe('Tasks, PRs and issues · filter by status or source')
  })
})

describe('serviceLabel', () => {
  it('maps known services to their display name', () => {
    expect(serviceLabel('github')).toBe('GitHub')
    expect(serviceLabel('jiraServer')).toBe('Jira Data Center')
    expect(serviceLabel('PARABOL')).toBe('Parabol')
  })

  it('falls back to the raw service string for unknown services', () => {
    expect(serviceLabel('slack')).toBe('slack')
  })
})

describe('itemSource', () => {
  it('credits the work item source and the drafter', () => {
    expect(itemSource('github')).toBe('GitHub · Parabol')
  })

  it('names Parabol once when the work items are already ours', () => {
    expect(itemSource('PARABOL')).toBe('Parabol')
  })
})
