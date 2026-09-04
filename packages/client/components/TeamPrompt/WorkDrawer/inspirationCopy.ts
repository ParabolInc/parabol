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

export const formatSince = (startAt?: string) => {
  if (!startAt) return 'recently'
  const start = dayjs(startAt)
  const hoursAgo = dayjs().diff(start, 'hour')
  if (hoursAgo <= 36) return 'yesterday'
  return start.format('MMM D')
}

export const metaLine = (workItemCount: number | undefined, since: string, promptCount: number) => {
  const source = workItemCount === undefined ? 'your work' : `${workItemCount} work items`
  const routed = promptCount === 1 ? 'your question' : `your ${promptCount} questions`
  return `Drafted from ${source} since ${since} · routed to ${routed}`
}

export const browseLabel = (workItemCount: number | undefined) =>
  workItemCount === undefined ? 'Browse work items' : `Browse all ${workItemCount} work items`

export const browseSubline = (dateRange?: WorkDrawerDateRange) => {
  if (!dateRange) return 'Tasks, PRs and issues · filter by status or source'
  const from = dayjs(dateRange.startAt).format('MMM D')
  const to = dayjs(dateRange.endAt).format('MMM D')
  return `Tasks, PRs and issues from ${from} – ${to} · filter by status or source`
}

export const addAllLabel = (remaining: number, total: number) =>
  remaining === total ? `Add all ${remaining} to my response` : `Add remaining ${remaining}`
