import dayjs from 'dayjs'
import JiraProjectId from '../../../shared/gqlIds/JiraProjectId'
import {makeLinearWorkFilter} from '../../../utils/makeLinearWorkFilter'
import type {InspirationSourceService, InspirationSourceSettings} from './inspirationSources'
import type {WorkDrawerDateRange} from './WorkDrawerDateFilter'

const buildInspirationSearchQuery = (
  service: InspirationSourceService,
  settings: InspirationSourceSettings,
  dateRange: WorkDrawerDateRange
) => {
  const {startAt, endAt} = dateRange
  const kinds = settings.kinds[service]
  switch (service) {
    case 'PARABOL':
      return JSON.stringify({startAt, endAt, include: kinds})
    case 'github': {
      const kindQualifier = kinds.length === 1 ? (kinds[0] === 'issue' ? 'is:issue' : 'is:pr') : ''
      const repos = settings.githubRepos.map((repo) => `repo:${repo}`).join(' ')
      const updated = `updated:${dayjs(startAt).format('YYYY-MM-DD')}..${dayjs(endAt).format('YYYY-MM-DD')}`
      return [kindQualifier, 'sort:updated involves:@me', repos, updated].filter(Boolean).join(' ')
    }
    case 'jira': {
      const from = dayjs(startAt).format('YYYY-MM-DD HH:mm')
      const to = dayjs(endAt).format('YYYY-MM-DD HH:mm')
      const people = [
        kinds.includes('assigned') && 'assignee = currentUser()',
        kinds.includes('created') && 'reporter = currentUser()'
      ].filter(Boolean)
      const projectKeys = settings.jiraProjectIds.map(
        (projectId) => `"${JiraProjectId.split(projectId).projectKey}"`
      )
      const conditions = [
        people.length > 1 ? `(${people.join(' OR ')})` : people[0],
        projectKeys.length > 0 && `project in (${projectKeys.join(', ')})`,
        `updated >= "${from}"`,
        `updated <= "${to}"`
      ].filter(Boolean)
      return `${conditions.join(' AND ')} order by updated DESC`
    }
    case 'linear':
      return JSON.stringify(makeLinearWorkFilter(settings.linearIds, dateRange))
    case 'gcal':
      return JSON.stringify({startDate: startAt, endDate: endAt})
  }
}

export default buildInspirationSearchQuery
