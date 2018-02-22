graphql`
  fragment CompleteTaskFrag on Task {
    id
    agendaId
    content
    createdAt
    createdBy
    integration {
      service
      nameWithOwner
      issueNumber
    }
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
`;
