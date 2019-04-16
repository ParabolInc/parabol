graphql`
  fragment CompleteTaskFrag on Task {
    id
    agendaId
    content
    createdAt
    createdBy
    dueDate
    integration {
      ... on GitHubTask {
        service
        nameWithOwner
        issueNumber
      }
    }
    meetingId
    reflectionGroupId
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
    assignee {
      id
      preferredName
      ... on TeamMember {
        picture
      }
    }
  }
`
