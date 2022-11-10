import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {LocalStorageKey} from '~/types/constEnums'
import Atmosphere from '../Atmosphere'
import {SimpleMutation} from '../types/relayMutations'
import getGraphQLError from '../utils/relay/getGraphQLError'
import {CreateImposterTokenMutation as ICreateImposterTokenMutation} from '../__generated__/CreateImposterTokenMutation.graphql'

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
  mutation CreateImposterTokenMutation($userId: ID, $email: Email) {
    createImposterToken(userId: $userId, email: $email) {
      error {
        message
      }
      ...CreateImposterTokenMutation_agendaItem @relay(mask: false)
    }
  }
`

const CreateImposterTokenMutation: SimpleMutation<ICreateImposterTokenMutation> = (
  atmosphere: Atmosphere,
  variables
) => {
  const onError = (err: Error) => {
    atmosphere.eventEmitter.emit('addSnackbar', {
      autoDismiss: 5,
      key: 'imposterError',
      message: err.message
    })
  }

  return commitMutation<ICreateImposterTokenMutation>(atmosphere, {
    mutation,
    variables,
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
      window.location.href = window.location.origin
    },
    onError
  })
}

export default CreateImposterTokenMutation
