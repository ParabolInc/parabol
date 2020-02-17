import graphql from 'babel-plugin-relay/macro'
graphql`
  fragment CompleteTaskFrag on Task {
    id
    content
    createdAt
    createdBy
    createdByUser {
      preferredName
    }
    dueDate
    integration {
      ... on TaskIntegrationGitHub {
        service
        nameWithOwner
        issueNumber
      }
    }
    meetingId
    threadId
    threadSource
    sortOrder
    status
    tags
    updatedAt
    userId
    teamId
    team {
      id
      name
    }
    user {
      id
      preferredName
      picture
    }
  }
`
