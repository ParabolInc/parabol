import type {JSONContent} from '@tiptap/core'
import dayjs from 'dayjs'
import type {WorkDrawerDateRange} from './WorkDrawerDateFilter'

const SERVICE_LABELS: Record<string, string> = {
  PARABOL: 'Parabol',
  github: 'GitHub',
  gitlab: 'GitLab',
  jira: 'Jira',
  jiraServer: 'Jira Data Center',
  linear: 'Linear',
  gcal: 'Google Calendar'
}

export const serviceLabel = (service: string) => SERVICE_LABELS[service] ?? service

export const NO_WORK_LINE =
  'No work was found. Try turning on more sources or widening the date range.'

export const dateRangeLabel = (dateRange: WorkDrawerDateRange, isSinceLastStandup: boolean) => {
  if (isSinceLastStandup) return 'Since last standup'
  const from = dayjs(dateRange.startAt).format('MMM D')
  const to = dayjs(dateRange.endAt).format('MMM D')
  return from === to ? from : `${from} – ${to}`
}

export const usedLabel = (unused: number, total: number) =>
  total === 0 ? '' : `Uses ${total - unused} of ${total} items`

export const issueCountLabel = (count: number | undefined, canDraft = true) =>
  count === undefined
    ? canDraft
      ? 'Not drafted yet'
      : 'Not loaded yet'
    : count === 1
      ? '1 item'
      : `${count} items`

export const addAllLabel = (remaining: number, total: number) =>
  remaining === total ? `Add all ${remaining} to my response` : `Add remaining ${remaining}`

export const collectText = (node: JSONContent): string[] =>
  node.text ? [node.text] : (node.content ?? []).flatMap(collectText)
