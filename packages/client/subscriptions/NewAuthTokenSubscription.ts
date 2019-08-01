import graphql from 'babel-plugin-relay/macro'

const subscription = graphql`
  subscription NewAuthTokenSubscription {
    newAuthToken
  }
`

const NewAuthTokenSubscription = () => ({subscription})

export default NewAuthTokenSubscription
