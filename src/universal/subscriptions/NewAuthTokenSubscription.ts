import {graphql} from 'react-relay'

const subscription = graphql`
  subscription NewAuthTokenSubscription {
    newAuthToken
  }
`

const NewAuthTokenSubscription = () => ({subscription})

export default NewAuthTokenSubscription
