export type RemoveIntegrationSearchQuerySuccessSource =
  | {
      userId: string
      teamId: string
    }
  | {error: {message: string}}

const RemoveIntegrationSearchQuerySuccess: {
  jiraServerIntegration: (
    source: RemoveIntegrationSearchQuerySuccessSource
  ) => RemoveIntegrationSearchQuerySuccessSource
} = {
  jiraServerIntegration: (source) => {
    return source
  }
}

export default RemoveIntegrationSearchQuerySuccess
