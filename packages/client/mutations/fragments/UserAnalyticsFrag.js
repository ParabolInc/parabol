import graphql from 'babel-plugin-relay/macro'
graphql`
  fragment UserAnalyticsFrag on User {
    id
    email
    picture
    preferredName
    createdAt
  }
`
