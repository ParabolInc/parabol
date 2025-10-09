import graphql from 'babel-plugin-relay/macro'

graphql`
  fragment SetAppLocationSuccessFrag_team on SetAppLocationSuccess {
    user {
      id
      lastSeenAtURLs
    }
  }
`
