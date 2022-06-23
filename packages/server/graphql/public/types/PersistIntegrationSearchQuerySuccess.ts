export type PersistIntegrationSearchQuerySource =
  | {
      userId: string
      teamId: string
    }
  | {error: {message: string}}

const PersistIntegrationSearchQuerySuccess: {
  jiraServerIntegration: (
    source: PersistIntegrationSearchQuerySource
  ) => PersistIntegrationSearchQuerySource
} = {
  jiraServerIntegration: (source) => {
    return source
  }
}

export default PersistIntegrationSearchQuerySuccess
