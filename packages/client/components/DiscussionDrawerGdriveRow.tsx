import {MoreVert} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {DiscussionDrawerGdriveRow_gdrive$key} from '../__generated__/DiscussionDrawerGdriveRow_gdrive.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import RemoveTeamMemberIntegrationAuthMutation from '../mutations/RemoveTeamMemberIntegrationAuthMutation'
import {Button} from '../ui/Button/Button'
import {Menu} from '../ui/Menu/Menu'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MenuItem} from '../ui/Menu/MenuItem'
import GDriveClientManager from '../utils/GDriveClientManager'
import GoogleMeetProviderLogo from './GoogleMeetProviderLogo'

interface Props {
  gdriveRef: DiscussionDrawerGdriveRow_gdrive$key
  teamId: string
}

const TWO_HOURS_MS = 2 * 60 * 60 * 1000

const DiscussionDrawerGdriveRow = ({gdriveRef, teamId}: Props) => {
  const gdrive = useFragment(
    graphql`
      fragment DiscussionDrawerGdriveRow_gdrive on GdriveIntegration {
        isActive
        watchExpiresAt
        cloudProvider {
          id
          clientId
        }
      }
    `,
    gdriveRef
  )

  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()
  const {submitting, onError, onCompleted} = mutationProps

  const cloudProvider = gdrive.cloudProvider
  if (!cloudProvider) return null

  const isConnected =
    gdrive.isActive &&
    !!gdrive.watchExpiresAt &&
    new Date(gdrive.watchExpiresAt).getTime() > Date.now() + TWO_HOURS_MS

  const handleConnect = () => {
    if (submitting) return
    GDriveClientManager.openOAuth(
      atmosphere,
      cloudProvider.id,
      cloudProvider.clientId,
      teamId,
      mutationProps
    )
  }

  const handleRemove = () => {
    if (submitting) return
    RemoveTeamMemberIntegrationAuthMutation(
      atmosphere,
      {service: 'gdrive', teamId},
      {onError, onCompleted}
    )
  }

  return (
    <div className='flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5'>
      <div className='flex items-center gap-2.5'>
        <GoogleMeetProviderLogo />
        <span className='font-medium text-slate-700 text-sm'>Google Meet</span>
      </div>
      {isConnected ? (
        <div className='flex items-center gap-1'>
          <span className='font-semibold text-jade-500 text-xs'>Connected</span>
          <Menu
            trigger={
              <Button variant='ghost' className='h-6 w-6 p-0'>
                <MoreVert className='text-base text-slate-500' />
              </Button>
            }
          >
            <MenuContent align='end' sideOffset={4}>
              <MenuItem onSelect={handleRemove}>{'Remove integration'}</MenuItem>
              <MenuItem onSelect={handleConnect}>{'Refresh auth token'}</MenuItem>
            </MenuContent>
          </Menu>
        </div>
      ) : (
        <button
          className='cursor-pointer whitespace-nowrap rounded border border-slate-400 bg-transparent px-1.5 py-0.5 font-semibold text-slate-600 text-xs hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50'
          onClick={handleConnect}
          disabled={submitting}
        >
          {'Connect'}
        </button>
      )}
    </div>
  )
}

export default DiscussionDrawerGdriveRow
