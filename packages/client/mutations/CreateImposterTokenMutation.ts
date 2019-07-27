import {commitMutation} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import signout from '../containers/Signout/signout'
import getGraphQLError from '../utils/relay/getGraphQLError'
import LoginMutation from './LoginMutation'
import Atmosphere from '../Atmosphere'

graphql`
  fragment CreateImposterTokenMutation_agendaItem on CreateImposterTokenPayload {
    authToken
    user {
      id
      email
      preferredName
    }
  }
`

const mutation = graphql`
  mutation CreateImposterTokenMutation($userId: ID!) {
    createImposterToken(userId: $userId) {
      error {
        message
      }
      ...CreateImposterTokenMutation_agendaItem @relay(mask: false)
    }
  }
`

const CreateImposterTokenMutation = (atmosphere: Atmosphere, userId, {history}) => {
  const onError = (err) => {
    atmosphere.eventEmitter.emit('addSnackbar', {
      autoDismiss: 5,
      key: 'imposterError',
      message: err.message
    })
  }

  return commitMutation(atmosphere, {
    mutation,
    variables: {userId},
    onCompleted: (res, errors) => {
      const serverError = getGraphQLError(res, errors)
      if (serverError) {
        onError(serverError)
        return
      }
      const {createImposterToken} = res
      const {authToken} = createImposterToken

      // Reset application state:
      signout(atmosphere, undefined, history)

      // Assume the identity of the new user:
      const onCompleted = () => {
        // Navigate to a default location, the application root:
        history.replace('/')
      }
      LoginMutation(atmosphere, {auth0Token: authToken}, {onCompleted, history})
    },
    onError
  })
}

export default CreateImposterTokenMutation
