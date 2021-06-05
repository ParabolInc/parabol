import graphql from 'babel-plugin-relay/macro'
graphql`
  fragment CompleteTaskFrag on Task {
    id
    content
    plaintextContent
    title
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
    sortOrder
    status
    tags
    discussionId
    threadSortOrder
    threadParentId
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
