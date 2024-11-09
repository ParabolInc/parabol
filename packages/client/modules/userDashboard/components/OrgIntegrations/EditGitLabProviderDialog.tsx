import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {EditGitLabProviderDialog_integrationProvider$key} from '../../../../__generated__/EditGitLabProviderDialog_integrationProvider.graphql'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import UpdateIntegrationProviderMutation from '../../../../mutations/UpdateIntegrationProviderMutation'
import UpsertGitLabProviderDialog from './UpsertGitLabProviderDialog'

type Props = {
  isOpen: boolean
  onClose: () => void
  integrationProviderRef: EditGitLabProviderDialog_integrationProvider$key
}

const EditGitLabProviderDialog = (props: Props) => {
  const {isOpen, onClose, integrationProviderRef} = props

  const IntegrationProvider = useFragment(
    graphql`
      fragment EditGitLabProviderDialog_integrationProvider on IntegrationProviderOAuth2 {
        id
        serverBaseUrl
        clientId
      }
    `,
    integrationProviderRef
  )
  const {id, serverBaseUrl, clientId} = IntegrationProvider

  const atmosphere = useAtmosphere()

  const {onError, onCompleted, submitting, submitMutation, error} = useMutationProps()

  const onUpsert = (serverBaseUrl: string, clientId: string, clientSecret: string) => {
    if (submitting) return

    submitMutation()
    UpdateIntegrationProviderMutation(
      atmosphere,
      {
        provider: {
          id,
          oAuth2ProviderMetadataInput: {
            serverBaseUrl,
            clientId,
            clientSecret
          }
        }
      },
      {
        onError,
        onCompleted: () => {
          onCompleted()
          onClose()
        }
      }
    )
  }

  return (
    <UpsertGitLabProviderDialog
      isOpen={isOpen}
      onClose={onClose}
      defaults={{
        serverBaseUrl,
        clientId,
        clientSecret: ''
      }}
      onUpsert={onUpsert}
      error={error}
    />
  )
}

export default EditGitLabProviderDialog
