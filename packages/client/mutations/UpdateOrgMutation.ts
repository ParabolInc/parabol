import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {Disposable} from 'relay-runtime'
import Atmosphere from '../Atmosphere'
import {UpdateOrgMutation as TUpdateOrgMutation} from '../__generated__/UpdateOrgMutation.graphql'
import {LocalHandlers} from '../types/relayMutations'
graphql`
  fragment UpdateOrgMutation_organization on UpdateOrgPayload {
    organization {
      name
    }
  }
`

const mutation = graphql`
  mutation UpdateOrgMutation($updatedOrg: UpdateOrgInput!) {
    updateOrg(updatedOrg: $updatedOrg) {
      error {
        message
      }
      ...UpdateOrgMutation_organization @relay(mask: false)
    }
  }
`

const UpdateOrgMutation = (
  atmosphere: Atmosphere,
  variables: TUpdateOrgMutation['variables'],
  {onCompleted, onError}: LocalHandlers
): Disposable => {
  return commitMutation<TUpdateOrgMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {updatedOrg} = variables
      const {id, name} = updatedOrg
      const organization = store.get(id)
      if (!organization) return
      if (name) {
        organization.setValue(name, 'name')
      }
    },
    onCompleted,
    onError
  })
}

export default UpdateOrgMutation
