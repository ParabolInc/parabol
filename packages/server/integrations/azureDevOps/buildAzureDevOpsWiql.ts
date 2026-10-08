import {
  AZURE_DEVOPS_IS_WORK,
  quoteWiql
} from 'parabol-client/shared/integrations/buildAzureDevOpsWorkWiql'

const CLOSED_STATES = ['Closed', 'Done', 'Removed']

const IS_WORK = AZURE_DEVOPS_IS_WORK
const IS_OPEN = `[System.State] NOT IN (${CLOSED_STATES.map(quoteWiql).join(', ')})`
const DEFAULT_ORDER = 'ORDER BY [System.ChangedDate] DESC'

/** Wraps a WHERE clause in the query the wiql endpoint takes. A project-scoped call is pinned to its project; an organization-wide one cannot use @project */
export const toWiqlQuery = (where: string, isProjectScoped: boolean, orderBy = DEFAULT_ORDER) => {
  const scope = isProjectScoped ? ' AND [System.TeamProject] = @project' : ''
  return `SELECT [System.Id] FROM WorkItems WHERE (${where})${scope} ${orderBy}`
}

/** Whether the parentheses, quotes and [field names] in WIQL text close, and where its top-level WHERE and ORDER BY start */
const scanWiql = (text: string) => {
  let depth = 0
  let closer: string | null = null
  let isBalanced = true
  let whereIndex = -1
  let orderByIndex = -1
  for (let i = 0; i < text.length; i++) {
    const char = text[i]!
    if (closer) {
      if (char === closer) closer = null
    } else if (char === "'" || char === '"') {
      closer = char
    } else if (char === '[') {
      closer = ']'
    } else if (char === '(') {
      depth++
    } else if (char === ')') {
      depth--
      if (depth < 0) isBalanced = false
    } else if (depth === 0 && !/\w/.test(text[i - 1] ?? ' ')) {
      if (whereIndex === -1 && /^where\b/i.test(text.slice(i, i + 6))) whereIndex = i
      else if (orderByIndex === -1 && /^order\s+by\b/i.test(text.slice(i))) orderByIndex = i
    }
  }
  return {isBalanced: isBalanced && depth === 0 && closer === null, whereIndex, orderByIndex}
}

interface WiqlSearch {
  where: string
  orderBy: string | undefined
}

/** The WHERE clause and ordering for a search typed into the scope panel. An Error is a WIQL clause that could not be safely scoped to a project */
export const buildAzureDevOpsSearchWiql = (
  queryString: string | null,
  isWIQL: boolean
): WiqlSearch | Error => {
  const query = queryString?.trim() ?? ''
  if (!query) return {where: `${IS_WORK} AND ${IS_OPEN}`, orderBy: undefined}
  if (isWIQL) {
    const {isBalanced, whereIndex, orderByIndex} = scanWiql(query)
    const isFullQuery = /^select\b/i.test(query)
    const whereStart = isFullQuery ? (whereIndex === -1 ? query.length : whereIndex + 5) : 0
    const whereEnd = Math.max(whereStart, orderByIndex === -1 ? query.length : orderByIndex)
    const where = query.slice(whereStart, whereEnd).trim()
    if (!isBalanced || !scanWiql(where).isBalanced) {
      return new Error('That WIQL has unbalanced parentheses, brackets or quotes')
    }
    return {
      where: where || `${IS_WORK} AND ${IS_OPEN}`,
      orderBy: orderByIndex === -1 ? undefined : query.slice(orderByIndex).trim()
    }
  }
  const titleMatch = `[System.Title] CONTAINS ${quoteWiql(query)} AND ${IS_WORK} AND ${IS_OPEN}`
  const workItemId = /^#?(\d{1,9})$/.exec(query)?.[1]
  return {
    where: workItemId ? `[System.Id] = ${workItemId} OR (${titleMatch})` : titleMatch,
    orderBy: undefined
  }
}
