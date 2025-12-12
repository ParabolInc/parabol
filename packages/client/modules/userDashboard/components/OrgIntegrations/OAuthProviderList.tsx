import AddIcon from '@mui/icons-material/Add'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import WebIcon from '@mui/icons-material/Web'
import Dialog from '@mui/material/Dialog'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment, useMutation} from 'react-relay'
import type {OAuthProviderList_organization$key} from '../../../../__generated__/OAuthProviderList_organization.graphql'
import RaisedButton from '../../../../components/RaisedButton'
import SecondaryButton from '../../../../components/SecondaryButton'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useSubscription from '../../../../hooks/useSubscription'
import organizationSubscription from '../../../../subscriptions/OrganizationSubscription'
import OAuthAppFormDialog from './OAuthAppFormDialog'

interface Props {
  organizationRef: OAuthProviderList_organization$key
}

const OAuthProviderList = ({organizationRef}: Props) => {
  const data = useFragment(
    graphql`
      fragment OAuthProviderList_organization on Organization {
        id
        oauthProviders {
          id
          name
          updatedAt
        }
      }
    `,
    organizationRef
  )

  useSubscription('OAuthProviderList', organizationSubscription)
  const atmosphere = useAtmosphere()

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [providerToDelete, setProviderToDelete] = useState<{id: string; name: string} | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProviderId, setEditingProviderId] = useState<string | null>(null)

  const [commitDelete] = useMutation(graphql`
    mutation OAuthProviderListDeleteMutation($input: DeleteOAuthAPIProviderInput!) {
      deleteOAuthAPIProvider(input: $input) {
        success
        deletedProviderId
      }
    }
  `)

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>, providerId: string) => {
    setAnchorEl(event.currentTarget)
    setSelectedProviderId(providerId)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedProviderId(null)
  }

  const handleEdit = () => {
    const providerId = selectedProviderId
    handleMenuClose()

    requestAnimationFrame(() => {
      setEditingProviderId(providerId)
      setDialogOpen(true)
    })
  }

  const handleDeleteClick = () => {
    const providerId = selectedProviderId
    const provider = providers.find((p) => p.id === providerId)

    handleMenuClose()

    if (provider) {
      requestAnimationFrame(() => {
        setProviderToDelete({id: provider.id, name: provider.name})
        setDeleteDialogOpen(true)
      })
    }
  }

  const handleConfirmDelete = () => {
    if (providerToDelete) {
      commitDelete({
        variables: {
          input: {
            providerId: providerToDelete.id
          }
        },
        updater: (store) => {
          const payload = store.getRootField('deleteOAuthAPIProvider')
          const deletedProviderId = payload?.getValue('deletedProviderId')
          if (!deletedProviderId) return

          const orgRecord = store.get(data.id)
          if (!orgRecord) return
          const providers = orgRecord.getLinkedRecords('oauthProviders')
          if (!providers) return
          const newProviders = providers.filter((p) => p.getDataID() !== deletedProviderId)
          orgRecord.setLinkedRecords(newProviders, 'oauthProviders')
        },
        optimisticUpdater: (store) => {
          const orgRecord = store.get(data.id)
          if (!orgRecord) return
          const providers = orgRecord.getLinkedRecords('oauthProviders')
          if (!providers) return
          const newProviders = providers.filter((p) => p.getDataID() !== providerToDelete.id)
          orgRecord.setLinkedRecords(newProviders, 'oauthProviders')
        },
        onCompleted: () => {
          setDeleteDialogOpen(false)
          setProviderToDelete(null)
        },
        onError: (error) => {
          setDeleteDialogOpen(false)
          atmosphere.eventEmitter.emit('addSnackbar', {
            key: 'deleteOAuthAPIProviderError',
            message: error.message || 'Something went wrong',
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

  const providers = data.oauthProviders || []

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4'>
        <div className='font-medium text-slate-700'>
          {providers.length} OAuth application{providers.length !== 1 ? 's' : ''}
        </div>
        <SecondaryButton size='small' onClick={handleAdd}>
          <AddIcon className='mr-2' />
          Add Application
        </SecondaryButton>
      </div>

      {providers.length === 0 && (
        <div className='py-8 text-center text-slate-500 italic'>
          No OAuth 2.0 applications configured.
        </div>
      )}

      <div className='space-y-2'>
        {providers.map((provider) => (
          <div
            key={provider.id}
            className='flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:bg-slate-50 hover:shadow-md'
            onClick={() => {
              setEditingProviderId(provider.id)
              setDialogOpen(true)
            }}
          >
            <div className='flex items-center gap-4'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600'>
                <WebIcon />
              </div>
              <div>
                <h4 className='font-semibold text-slate-900'>{provider.name}</h4>
                <p className='text-slate-500 text-xs'>
                  Last updated {new Date(provider.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <IconButton
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation()
                handleMenuOpen(e, provider.id)
              }}
            >
              <MoreVertIcon className='text-slate-400' />
            </IconButton>
          </div>
        ))}
      </div>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{horizontal: 'right', vertical: 'top'}}
        anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
      >
        <MenuItem onClick={handleEdit}>Edit application</MenuItem>
        <MenuItem onClick={handleDeleteClick} className='text-red-600'>
          Delete application
        </MenuItem>
      </Menu>

      {dialogOpen && (
        <OAuthAppFormDialog
          orgId={data.id}
          providerId={editingProviderId}
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
        />
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth='xs'
        fullWidth
      >
        <div className='p-6'>
          <h3 className='mb-4 font-semibold text-lg text-slate-900'>Delete Application?</h3>
          <p className='mb-6 text-slate-600'>
            Are you sure you want to delete{' '}
            <span className='font-semibold'>{providerToDelete?.name}</span>? This action cannot be
            undone.
          </p>
          <div className='flex justify-end gap-3'>
            <SecondaryButton onClick={() => setDeleteDialogOpen(false)}>Cancel</SecondaryButton>
            <RaisedButton palette='pink' onClick={handleConfirmDelete}>
              Delete
            </RaisedButton>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

export default OAuthProviderList
