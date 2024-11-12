import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import AddIntegrationProviderMutation from '../../../../mutations/AddIntegrationProviderMutation'
import UpsertGitLabProviderDialog from './UpsertGitLabProviderDialog'

type Props = {
  orgId: string
  isOpen: boolean
  onClose: () => void
}

const AddGitLabProviderDialog = (props: Props) => {
  const {orgId, isOpen, onClose} = props
  const atmosphere = useAtmosphere()
  const {onError, onCompleted, submitting, submitMutation, error} = useMutationProps()

  const onUpsert = (serverBaseUrl: string, clientId: string, clientSecret: string) => {
    if (submitting) return

    submitMutation()
    AddIntegrationProviderMutation(
      atmosphere,
      {
        input: {
          orgId,
          service: 'gitlab',
          authStrategy: 'oauth2',
          scope: 'org',
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
      defaults={{
        serverBaseUrl: '',
        clientId: '',
        clientSecret: ''
      }}
      onUpsert={onUpsert}
      onClose={onClose}
      error={error}
    />
  )
}

export default AddGitLabProviderDialog
