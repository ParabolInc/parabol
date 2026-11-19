import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment, useMutation} from 'react-relay'
import {Add as AddIcon} from '~/ui/icons'
import getMutationError from '~/utils/relay/getMutationError'
import type {OAuthProviderList_organization$key} from '../../../../__generated__/OAuthProviderList_organization.graphql'
import Panel from '../../../../components/Panel/Panel'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {Button} from '../../../../ui/Button/Button'
import {Dialog} from '../../../../ui/Dialog/Dialog'
import {DialogActions} from '../../../../ui/Dialog/DialogActions'
import {DialogContent} from '../../../../ui/Dialog/DialogContent'
import {DialogTitle} from '../../../../ui/Dialog/DialogTitle'
import OAuthAppFormDialog from './OAuthAppFormDialog'
import OAuthProviderRow from './OAuthProviderRow'

interface Props {
  organizationRef: OAuthProviderList_organization$key
}

const OAuthProviderList = ({organizationRef}: Props) => {
  const data = useFragment(
    graphql`
      fragment OAuthProviderList_organization on Organization {
        id
        oauthApplications {
          id
          name
          updatedAt
        }
      }
    `,
    organizationRef
  )

  const atmosphere = useAtmosphere()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [providerToDelete, setProviderToDelete] = useState<{id: string; name: string} | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProviderId, setEditingProviderId] = useState<string | null>(null)

  const [commitDelete] = useMutation(graphql`
    mutation OAuthProviderListDeleteMutation($providerId: ID!) {
      deleteOAuthAPIProvider(providerId: $providerId) {
        deletedProviderId
      }
    }
  `)

  const handleEdit = (providerId: string) => {
    setEditingProviderId(providerId)
    setDialogOpen(true)
  }

  const handleDeleteClick = (provider: {id: string; name: string}) => {
    setProviderToDelete({id: provider.id, name: provider.name})
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (providerToDelete) {
      commitDelete({
        variables: {
          providerId: providerToDelete.id
        },
        updater: (store) => {
          const payload = store.getRootField('deleteOAuthAPIProvider')
          const deletedProviderId = payload?.getValue('deletedProviderId')
          if (!deletedProviderId) return

          const orgRecord = store.get(data.id)
          if (!orgRecord) return
          const providers = orgRecord.getLinkedRecords('oauthApplications')
          if (!providers) return
          const newProviders = providers.filter((p) => p.getDataID() !== deletedProviderId)
          orgRecord.setLinkedRecords(newProviders, 'oauthApplications')
        },
        optimisticUpdater: (store) => {
          const orgRecord = store.get(data.id)
          if (!orgRecord) return
          const providers = orgRecord.getLinkedRecords('oauthApplications')
          if (!providers) return
          const newProviders = providers.filter((p) => p.getDataID() !== providerToDelete.id)
          orgRecord.setLinkedRecords(newProviders, 'oauthApplications')
        },
        onCompleted: () => {
          setDeleteDialogOpen(false)
          setProviderToDelete(null)
        },
        onError: (error) => {
          setDeleteDialogOpen(false)
          atmosphere.eventEmitter.emit('addSnackbar', {
            key: 'deleteOAuthAPIProviderError',
            message: getMutationError(error).message || 'Something went wrong',
            autoDismiss: 0,
            action: {
              label: 'Dismiss',
              callback: () => {
                atmosphere.eventEmitter.emit(
                  'removeSnackbar',
                  ({key}) => key === 'deleteOAuthAPIProviderError'
                )
              }
            }
          })
        }
      })
    }
  }

  const handleAdd = () => {
    setEditingProviderId(null)
    setDialogOpen(true)
  }

  const providers = data.oauthApplications || []

  const controls = (
    <Button variant='outline' size='sm' onClick={handleAdd}>
      <AddIcon className='mr-2' />
      Add Application
    </Button>
  )

  return (
    <Panel className='max-w-[976px]' label='OAuth 2.0 API' controls={controls}>
      <div className='border-hairline border-t px-4 py-3 text-fg-secondary text-sm'>
        Configure your organization as an OAuth 2.0 provider to allow external applications to
        authenticate with your Parabol organization.
      </div>
      {providers.length === 0 ? (
        <div className='border-hairline border-t p-8 text-center text-fg-muted text-sm'>
          No OAuth applications yet.
        </div>
      ) : (
        <div className='overflow-x-auto border-hairline border-t'>
          <table className='w-full border-collapse text-sm'>
            <thead>
              <tr className='border-hairline border-b bg-surface-raised text-left text-fg-muted text-xs uppercase tracking-wider'>
                <th className='px-4 py-2 font-semibold'>Name</th>
                <th className='px-4 py-2 font-semibold'>Last Updated</th>
                <th className='px-4 py-2' />
              </tr>
            </thead>
            <tbody>
              {providers.map((provider) => (
                <OAuthProviderRow
                  key={provider.id}
                  name={provider.name}
                  updatedAt={provider.updatedAt}
                  onEdit={() => handleEdit(provider.id)}
                  onDelete={() => handleDeleteClick(provider)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {dialogOpen && (
        <OAuthAppFormDialog
          orgId={data.id}
          providerId={editingProviderId}
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
        />
      )}

      <Dialog isOpen={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogContent className='max-w-md'>
          <DialogTitle className='mt-4.5 mb-4 text-fg-primary text-lg'>
            Delete Application?
          </DialogTitle>
          <p className='text-fg-secondary'>
            Are you sure you want to delete{' '}
            <span className='font-semibold'>{providerToDelete?.name}</span>? This action cannot be
            undone.
          </p>
          <DialogActions>
            <Button variant='outline' size='md' onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant='primary' size='md' onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </Panel>
  )
}

export default OAuthProviderList
