import {commitMutation, graphql} from 'react-relay'
import {Disposable} from 'relay-runtime'
import Atmosphere from '../Atmosphere'
import {
  UpdateOrgMutation,
  UpdateOrgMutationVariables
} from '__generated__/UpdateOrgMutation.graphql'
import {LocalHandlers} from '../types/relayMutations'
graphql`
  fragment UpdateOrgMutation_organization on UpdateOrgPayload {
    organization {
      name
      picture
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
  variables: UpdateOrgMutationVariables,
  {onCompleted, onError}: LocalHandlers
): Disposable => {
  return commitMutation<UpdateOrgMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {updatedOrg} = variables
      const {id, picture, name} = updatedOrg
      const organization = store.get(id)
      if (!organization) return
      if (picture) {
        organization.setValue(picture, 'picture')
      }
      if (name) {
        organization.setValue(name, 'name')
      }
    },
    onCompleted,
    onError
  })
}

export default UpdateOrgMutation
