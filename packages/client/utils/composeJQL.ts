const buildIssueKeyJQL = (queryString: string | null, filteredProjectKeys: string[]) => {
  if (!queryString) return ''
  const maybeIssueKeys = queryString.split(/[\s,]+/)
  if (maybeIssueKeys.length === 0) return ''

  const validIssueKeys = maybeIssueKeys
    .flatMap((rawIssueKey) => {
      const maybeIssueKey = rawIssueKey.toUpperCase()
      const match = maybeIssueKey.match(
        /(?<projectKey>[A-Za-z][A-Za-z_0-9]+)*-*(?<issueNumber>\d+)/
      )
      if (!match || !match.groups) return ''

      const {projectKey: maybeProjectKey, issueNumber: maybeIssueNumber} = match.groups
      if (maybeProjectKey && !maybeIssueNumber) return ''
      else if (maybeProjectKey && maybeIssueNumber) {
        if (
          filteredProjectKeys.length === 0 ||
          (filteredProjectKeys.length !== 0 && filteredProjectKeys.includes(maybeProjectKey))
        ) {
          return `${maybeProjectKey}-${maybeIssueNumber}`
        } else {
          return ''
        }
      } else if (!maybeProjectKey && maybeIssueNumber) {
        if (filteredProjectKeys.length === 0) {
          return ''
        } else {
          return filteredProjectKeys.map((projectKey) => `${projectKey}-${maybeIssueNumber}`)
        }
      } else {
        return ''
      }
    })
    .filter(String)
    .map((issueKey) => `\"${issueKey}\"`)
  return validIssueKeys.length > 0 ? ` OR issueKey in (${validIssueKeys.join(', ')})` : ''
}

// Compose a JQL query. Because Atlassian does not allow for unbound queries anymore, we need
// will return only issues viewed in the last 30 days if no query is provided.
const composeJQL = (queryString: string | null, isJQL: boolean, projectKeys: string[]) => {
  const orderBy = 'order by lastViewed DESC'
  if (isJQL) return queryString || orderBy
  const projectFilter = projectKeys.length
    ? `project in (${projectKeys.map((val) => `\"${val}\"`).join(', ')})`
    : ''

  const issueKeyJQL = buildIssueKeyJQL(queryString, projectKeys)
  const textFilter = queryString ? `text ~ \"${queryString}\"${issueKeyJQL}` : ''
  const and = projectFilter && textFilter ? ' AND ' : ''

  const noUnboundQuery = !projectFilter && !textFilter ? 'lastViewed > -30d' : ''
  return `${projectFilter}${and}${textFilter} ${noUnboundQuery} ${orderBy}`
}

export default composeJQL
