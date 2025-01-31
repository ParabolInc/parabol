import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {RemoveIntegrationProviderDialog_integrationProvider$key} from '../../../../__generated__/RemoveIntegrationProviderDialog_integrationProvider.graphql'
import PrimaryButton from '../../../../components/PrimaryButton'
import useMutationProps from '../../../../hooks/useMutationProps'
import RemoveIntegrationProviderMutation from '../../../../mutations/RemoveIntegrationProviderMutation'
import {Dialog} from '../../../../ui/Dialog/Dialog'
import {DialogContent} from '../../../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../../../ui/Dialog/DialogTitle'

interface Props {
  isOpen: boolean
  onClose: () => void
  integrationProviderRef: RemoveIntegrationProviderDialog_integrationProvider$key
}

const prettifyService = (service: string) => {
  switch (service) {
    case 'gitlab':
      return 'GitLab'
    case 'github':
      return 'GitHub'
    default:
      return service.charAt(0).toUpperCase() + service.slice(1)
  }
}

const RemoveIntegrationProviderDialog = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {isOpen, onClose, integrationProviderRef} = props
  const integrationProvider = useFragment(
    graphql`
      fragment RemoveIntegrationProviderDialog_integrationProvider on IntegrationProvider {
        id
        service
        ... on IntegrationProviderOAuth2 {
          serverBaseUrl
        }
      }
    `,
    integrationProviderRef
  )
  const {id: providerId, service, serverBaseUrl} = integrationProvider
  const {onCompleted, onError} = useMutationProps()

  const handleClick = () => {
    onClose()
    RemoveIntegrationProviderMutation(atmosphere, {providerId}, {onCompleted, onError})
  }
  const prettyService = prettifyService(service)
  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogContent>
        <DialogTitle className='flex items-center'>Are you sure?</DialogTitle>
        <div className='pt-6 pb-2'>
          If you remove this{' '}
          <b>
            {prettyService}
            {serverBaseUrl && ` (${serverBaseUrl.replace(/https:\/\//, '')})`}
          </b>{' '}
          integration, it will no longer be available to any teams.
        </div>
        <div className='flex justify-end pt-6'>
          <PrimaryButton type='submit' onClick={handleClick}>
            Remove {prettyService} integration
          </PrimaryButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default RemoveIntegrationProviderDialog
