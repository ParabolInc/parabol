const IntegrationSearchQueryId = {
  join: (typeName: 'JiraSearchQuery' | 'GitHubSearchQuery', id: number | string) =>
    `${typeName}:${id}`,
  split: (globalId: string) => Number.parseInt(globalId.split(':')[1]!, 10)
}

export default IntegrationSearchQueryId
