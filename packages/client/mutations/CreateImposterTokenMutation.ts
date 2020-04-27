import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import Atmosphere from '../Atmosphere'
import getGraphQLError from '../utils/relay/getGraphQLError'
import {CreateImposterTokenMutation as ICreateImposterTokenMutation} from '../__generated__/CreateImposterTokenMutation.graphql'
import {LocalStorageKey} from '~/types/constEnums'

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

const CreateImposterTokenMutation = (atmosphere: Atmosphere, userId) => {
  const onError = (err) => {
    atmosphere.eventEmitter.emit('addSnackbar', {
      autoDismiss: 5,
      key: 'imposterError',
      message: err.message
    })
  }

  return commitMutation<ICreateImposterTokenMutation>(atmosphere, {
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
      if (!authToken) return
      atmosphere.close()
      window.localStorage.setItem(LocalStorageKey.APP_TOKEN_KEY, authToken)
      window.location.reload()
    },
    onError
  })
}

export default CreateImposterTokenMutation
