import dayjs from 'dayjs'
import {dateRangeLabel, issueCountLabel, serviceLabel, usedLabel} from '../inspirationCopy'

describe('dateRangeLabel', () => {
  const local = (time: string) => dayjs(time).toISOString()
  const dateRange = {startAt: local('2026-09-17T09:00'), endAt: local('2026-09-24T17:00')}

  it('names the default window after the last standup', () => {
    expect(dateRangeLabel(dateRange, true)).toBe('Since last standup')
  })

  it('formats a custom window as a date range', () => {
    expect(dateRangeLabel(dateRange, false)).toBe('Sep 17 – Sep 24')
  })

  it('shows a single day once', () => {
    const oneDay = {startAt: local('2026-09-24T09:00'), endAt: local('2026-09-24T17:00')}
    expect(dateRangeLabel(oneDay, false)).toBe('Sep 24')
  })
})

describe('usedLabel', () => {
  it('counts the issues the draft used', () => {
    expect(usedLabel(1, 6)).toBe('Uses 5 of 6 items')
  })

  it('says nothing when no work matched', () => {
    expect(usedLabel(0, 0)).toBe('')
  })
})

describe('issueCountLabel', () => {
  it('pluralizes the count', () => {
    expect(issueCountLabel(1)).toBe('1 item')
    expect(issueCountLabel(6)).toBe('6 items')
  })

  it('says when a source has not been drafted from yet', () => {
    expect(issueCountLabel(undefined)).toBe('Not drafted yet')
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
