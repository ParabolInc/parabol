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
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useSubscription from '../../../../hooks/useSubscription'
import organizationSubscription from '../../../../subscriptions/OrganizationSubscription'
import {Button} from '../../../../ui/Button/Button'
import plural from '../../../../utils/plural'
import OAuthAppFormDialog from './OAuthAppFormDialog'

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

  useSubscription('OAuthProviderList', organizationSubscription)
  const atmosphere = useAtmosphere()

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null)
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

  const providers = data.oauthApplications || []

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between rounded-lg border border-hairline bg-surface-raised p-4'>
        <div className='font-medium text-fg-primary'>
          {providers.length} OAuth {plural(providers.length, 'application')}
        </div>
        <Button variant='outline' size='sm' onClick={handleAdd}>
          <AddIcon className='mr-2' />
          Add Application
        </Button>
      </div>

      {providers.length === 0 && (
        <div className='py-8 text-center text-fg-muted italic'>
          No OAuth 2.0 applications configured.
        </div>
      )}

      <div className='space-y-2'>
        {providers.map((provider) => (
          <div
            key={provider.id}
            className='flex cursor-pointer items-center justify-between rounded-lg border border-hairline bg-surface-card p-4 shadow-sm transition-shadow hover:bg-surface-hover hover:shadow-md'
            onClick={() => {
              setEditingProviderId(provider.id)
              setDialogOpen(true)
            }}
          >
            <div className='flex items-center gap-4'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent'>
                <WebIcon />
              </div>
              <div className='flex flex-col'>
                <span className='font-semibold text-fg-primary text-lg'>{provider.name}</span>
                <span className='text-fg-muted text-xs'>
                  Last updated {new Date(provider.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <IconButton
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation()
                handleMenuOpen(e, provider.id)
              }}
            >
              <MoreVertIcon className='text-fg-muted' />
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
        <MenuItem onClick={handleDeleteClick} className='text-tomato-600'>
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
          <h3 className='mb-4 font-semibold text-fg-primary text-lg'>Delete Application?</h3>
          <p className='mb-6 text-fg-secondary'>
            Are you sure you want to delete{' '}
            <span className='font-semibold'>{providerToDelete?.name}</span>? This action cannot be
            undone.
          </p>
          <div className='flex justify-end gap-3'>
            <Button variant='outline' size='md' onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant='destructive' size='md' onClick={handleConfirmDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

export default OAuthProviderList
