import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import type {CreateImposterTokenMutation as ICreateImposterTokenMutation} from '../__generated__/CreateImposterTokenMutation.graphql'
import type Atmosphere from '../Atmosphere'
import type {SimpleMutation} from '../types/relayMutations'
import getGraphQLError from '../utils/relay/getGraphQLError'

graphql`
  fragment CreateImposterTokenMutation_agendaItem on CreateImposterTokenPayload {
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
      const user = createImposterToken?.user
      if (!user) {
        onError(new Error('No user returned'))
        return
      }
      window.location.href = window.location.origin
    },
    onError
  })
}

export default CreateImposterTokenMutation
