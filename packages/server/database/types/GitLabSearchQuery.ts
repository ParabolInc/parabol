import generateUID from '../../generateUID'

interface Input {
  id?: string
  queryString: string
  lastUsedAt?: Date
}

export default class GitLabSearchQuery {
  id: string
  queryString: string
  lastUsedAt: Date
  constructor(input: Input) {
    const {id, queryString, lastUsedAt} = input
    this.id = id || generateUID()
    this.queryString = queryString
    this.lastUsedAt = lastUsedAt || new Date()
  }
}
