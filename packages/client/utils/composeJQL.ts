const buildIssueKeyJQL = (
  queryString: string | null,
  filteredProjectKeys: string[]
) => {
  if (!queryString) return ''
  const maybeIssueKeys = queryString.split(/[\s,]+/)
  if (maybeIssueKeys.length === 0) return ''

  const validIssueKeys = maybeIssueKeys
    .map((rawIssueKey) => {
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
    .flat()
    .filter(String)
    .map((issueKey) => `\"${issueKey}\"`)
  return validIssueKeys.length > 0 ? ` OR issueKey in (${validIssueKeys.join(', ')})` : ''
}

const composeJQL = (queryString: string | null, isJQL: boolean, projectKeys: string[]) => {
  const orderBy = 'order by lastViewed DESC'
  if (isJQL) return queryString || orderBy
  const projectFilter = projectKeys.length
    ? `project in (${projectKeys.map((val) => `\"${val}\"`).join(', ')})`
    : ''

  const issueKeyJQL = buildIssueKeyJQL(queryString, projectKeys)
  const textFilter = queryString ? `text ~ \"${queryString}\"${issueKeyJQL}` : ''
  const and = projectFilter && textFilter ? ' AND ' : ''
  return `${projectFilter}${and}${textFilter} ${orderBy}`
}

export default composeJQL;