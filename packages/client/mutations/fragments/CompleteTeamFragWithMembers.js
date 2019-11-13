import graphql from 'babel-plugin-relay/macro'
graphql`
  fragment CompleteTeamFragWithMembers on Team {
    id
    name
    isPaid
    isArchived
    teamMembers(sortBy: "preferredName") {
      ...CompleteTeamMemberFrag @relay(mask: false)
    }
  }
`
