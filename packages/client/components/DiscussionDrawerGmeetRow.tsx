import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {MoreVert} from '~/ui/icons'
import type {DiscussionDrawerGmeetRow_gmeet$key} from '../__generated__/DiscussionDrawerGmeetRow_gmeet.graphql'
import useAtmosphere from '../hooks/useAtmosphere'
import useMutationProps from '../hooks/useMutationProps'
import RemoveTeamMemberIntegrationAuthMutation from '../mutations/RemoveTeamMemberIntegrationAuthMutation'
import {Button} from '../ui/Button/Button'
import {Menu} from '../ui/Menu/Menu'
import {MenuContent} from '../ui/Menu/MenuContent'
import {MenuItem} from '../ui/Menu/MenuItem'
import GmeetClientManager from '../utils/GmeetClientManager'
import GoogleMeetProviderLogo from './GoogleMeetProviderLogo'

interface Props {
  gmeetRef: DiscussionDrawerGmeetRow_gmeet$key
  teamId: string
}

const DiscussionDrawerGmeetRow = ({gmeetRef, teamId}: Props) => {
  const gmeet = useFragment(
    graphql`
      fragment DiscussionDrawerGmeetRow_gmeet on GmeetIntegration {
        isActive
        cloudProvider {
          id
          clientId
        }
      }
    `,
    gmeetRef
  )

  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()
  const {submitting, onError, onCompleted, error} = mutationProps

  const cloudProvider = gmeet.cloudProvider
  if (!cloudProvider) return null

  const isConnected = gmeet.isActive

  const handleConnect = () => {
    if (submitting) return
    GmeetClientManager.openOAuth(
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
      {service: 'gmeet', teamId},
      {onError, onCompleted}
    )
  }

  return (
    <div className='flex flex-col gap-1.5 rounded-lg border border-hairline px-3 py-2.5'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2.5'>
          <GoogleMeetProviderLogo />
          <span className='font-medium text-fg-primary text-sm'>Google Meet</span>
        </div>
        {isConnected ? (
          <div className='flex items-center gap-1'>
            <span className='font-semibold text-jade-500 text-xs'>Connected</span>
            <Menu
              trigger={
                <Button variant='ghost' className='h-6 w-6 p-0'>
                  <MoreVert className='text-base text-fg-secondary' />
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
            className='cursor-pointer whitespace-nowrap rounded border border-hairline-strong bg-transparent px-1.5 py-0.5 font-semibold text-fg-secondary text-xs hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50'
            onClick={handleConnect}
            disabled={submitting}
          >
            {'Connect'}
          </button>
        )}
      </div>
      {error && <div className='text-fg-error text-xs'>{error.message}</div>}
    </div>
  )
}

export default DiscussionDrawerGmeetRow
