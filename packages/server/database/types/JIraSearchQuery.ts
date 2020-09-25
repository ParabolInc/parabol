import shortid from 'shortid'

interface Input {
  id?: string
  queryString: string
  isJQL: boolean
  projectKeyFilters?: string[]
  issueTypeFilters?: string[]
  lastUsedAt?: Date
}

export default class JiraSearchQuery {
  id: string
  queryString: string
  isJQL: boolean
  projectKeyFilters?: string[]
  issueTypeFilters?: string[]
  lastUsedAt: Date
  constructor(input: Input) {
    const {id, queryString, isJQL, projectKeyFilters, issueTypeFilters, lastUsedAt} = input
    this.id = id || shortid.generate()
    this.queryString = queryString
    this.isJQL = isJQL
    this.projectKeyFilters = projectKeyFilters
    this.issueTypeFilters = issueTypeFilters
    this.lastUsedAt = lastUsedAt || new Date()
  }
}
