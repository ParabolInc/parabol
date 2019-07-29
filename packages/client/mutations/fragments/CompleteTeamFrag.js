import graphql from 'babel-plugin-relay/macro'
graphql`
  fragment CompleteTeamFrag on Team {
    id
    name
    isPaid
    meetingId
    isArchived
  }
`
