import graphql from 'babel-plugin-relay/macro'
graphql`
  fragment CompleteTeamMemberFrag on TeamMember {
    id
    checkInOrder
    isLead
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
