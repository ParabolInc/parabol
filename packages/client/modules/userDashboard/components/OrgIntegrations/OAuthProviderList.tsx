import AddIcon from '@mui/icons-material/Add'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import WebIcon from '@mui/icons-material/Web'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment, useMutation} from 'react-relay'
import {useHistory, useRouteMatch} from 'react-router'
import type {OAuthProviderList_organization$key} from '../../../../__generated__/OAuthProviderList_organization.graphql'
import SecondaryButton from '../../../../components/SecondaryButton'
import useSubscription from '../../../../hooks/useSubscription'
import organizationSubscription from '../../../../subscriptions/OrganizationSubscription'

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

  const history = useHistory()
  const match = useRouteMatch()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null)

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
    if (selectedProviderId) {
      history.push(`${match.url}/oauth/${selectedProviderId}`)
    }
    handleMenuClose()
  }

  const handleDelete = () => {
    if (selectedProviderId && confirm('Are you sure you want to delete this application?')) {
      commitDelete({
        variables: {
          input: {
            providerId: selectedProviderId
          }
        },
        onCompleted: () => {
          // Relay should automatically update the list if the connection is configured correctly,
          // or we might need updater config. For now, let's rely on standard Relay behavior.
        },
        optimisticUpdater: (store) => {
          if (!selectedProviderId) return
          const orgRecord = store.get(data.id)
          if (!orgRecord) return
          const providers = orgRecord.getLinkedRecords('oauthProviders')
          if (!providers) return
          const newProviders = providers.filter((p) => p.getDataID() !== selectedProviderId)
          orgRecord.setLinkedRecords(newProviders, 'oauthProviders')
        }
      })
    }
    handleMenuClose()
  }

  const handleAdd = () => {
    history.push(`${match.url}/oauth/new`)
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
            className='flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md'
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
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleMenuOpen(e, provider.id)}
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
        <MenuItem onClick={handleDelete} className='text-red-600'>
          Delete application
        </MenuItem>
      </Menu>
    </div>
  )
}

export default OAuthProviderList
