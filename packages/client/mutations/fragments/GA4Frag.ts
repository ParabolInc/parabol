import graphql from 'babel-plugin-relay/macro'
graphql`
  fragment GA4Frag on UserLogInPayload {
    authToken
    isNewUser
    user {
      tms
      isPatient0
      ...UserAnalyticsFrag @relay(mask: false)
    }
  }
`
