graphql`
  fragment CompleteTeamMemberFrag on TeamMember {
    id
    checkInOrder
    isLead
    isConnected
    isNotRemoved
    picture
    preferredName
    teamId
    userId
    user {
      isConnected
    }
  }
`
