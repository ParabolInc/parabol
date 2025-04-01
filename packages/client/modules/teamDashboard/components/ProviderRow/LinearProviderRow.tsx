import {Done as DoneIcon, MoreVert as MoreVertIcon} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React from 'react' // Import React
import {useFragment} from 'react-relay'
import {LinearProviderRow_viewer$key} from '../../../../__generated__/LinearProviderRow_viewer.graphql'
import FlatButton from '../../../../components/FlatButton'
import LinearProviderLogo from '../../../../components/LinearProviderLogo'
import ProviderActions from '../../../../components/ProviderActions'
import RowInfo from '../../../../components/Row/RowInfo'
import RowInfoCopy from '../../../../components/Row/RowInfoCopy'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useBreakpoint from '../../../../hooks/useBreakpoint'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import useMutationProps from '../../../../hooks/useMutationProps'
import {Breakpoint} from '../../../../types/constEnums'
import LinearClientManager from '../../../../utils/LinearClientManager'
import ConnectButton from './ConnectButton'
import LinearConfigMenu from './LinearConfigMenu' // Import the config menu

interface Props {
  teamId: string
  viewerRef: LinearProviderRow_viewer$key
}

// Fragment for viewer data, including teamMember
const LinearProviderRow_viewer = graphql`
  fragment LinearProviderRow_viewer on User {
    teamMember(teamId: $teamId) {
      ...LinearProviderRowTeamMember @relay(mask: false)
    }
  }
`

// Fragment for teamMember data, including Linear integration details
graphql`
  fragment LinearProviderRowTeamMember on TeamMember {
    id
    integrations {
      linear {
        auth {
          id
        }
        clientId # Fetch clientId directly from LinearIntegration
      }
    }
  }
`

const LinearProviderRow: React.FC<Props> = ({teamId, viewerRef}) => {
  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()
  const {submitting, error} = mutationProps

  const viewer = useFragment(LinearProviderRow_viewer, viewerRef)
  const teamMember = viewer.teamMember
  const linearIntegration = teamMember?.integrations?.linear

  const connected = !!linearIntegration?.auth
  const clientId = linearIntegration?.clientId

  const {
    originRef: menuRef,
    menuPortal,
    menuProps,
    togglePortal
  } = useMenu(MenuPosition.UPPER_RIGHT)
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)

  const connectLinear = () => {
    if (!clientId) {
      console.error('Linear Client ID is missing.')
      // Optionally, update mutationProps error state
      return
    }
    LinearClientManager.openOAuth(atmosphere, clientId, teamId, mutationProps)
  }

  // Placeholder for disconnect logic - will be part of LinearConfigMenu
  // const disconnectLinear = () => { ... }

  // Render null if clientId isn't available (shouldn't happen if backend is configured)
  if (!clientId && !connected) return null

  return (
    <>
      <div className='relative my-4 flex w-full shrink-0 flex-col justify-start rounded-sm bg-white shadow-card'>
        <div className='flex justify-start p-row-gutter pb-row-gutter'>
          {' '}
          {/* Adjusted padding */}
          <LinearProviderLogo />
          <div className='flex w-full flex-col'>
            {/* Linear only has one provider type (cloud) unlike GitLab */}
            <div className='flex w-full flex-row'>
              <RowInfo>
                <div className='mr-4 flex items-center align-middle leading-6 font-semibold text-slate-700'>
                  Linear
                </div>
                <RowInfoCopy>Use Linear Issues from within Parabol.</RowInfoCopy>
                {!!error?.message && (
                  <div className='text-sm text-tomato-500 [&_a]:font-semibold [&_a]:text-tomato-500 [&_a]:underline'>
                    {error.message}
                  </div>
                )}
              </RowInfo>
              <ProviderActions>
                {!connected &&
                  clientId && ( // Ensure clientId exists before showing connect button
                    <ConnectButton onConnectClick={connectLinear} submitting={submitting} />
                  )}
                {connected && (
                  <>
                    {isDesktop ? (
                      <>
                        <div className='flex items-center pr-6'>
                          <DoneIcon className='h-[18px] w-[18px] text-lg text-success-light' />
                          <div className='pl-[6px] text-sm font-semibold text-slate-700'>
                            Connected
                          </div>
                        </div>
                        <FlatButton
                          className='min-w-[30px] border-slate-400 px-1 py-1 text-sm font-semibold text-slate-700' // Adjusted padding
                          onClick={togglePortal}
                          ref={menuRef}
                        >
                          <MoreVertIcon className='h-[18px] w-[18px] text-lg' />
                        </FlatButton>
                      </>
                    ) : (
                      <FlatButton
                        className='min-w-[36px] border-slate-400 px-1 py-1 text-sm font-semibold text-slate-700' // Adjusted padding
                        onClick={togglePortal}
                        ref={menuRef}
                      >
                        <MoreVertIcon />
                      </FlatButton>
                    )}
                  </>
                )}
              </ProviderActions>
            </div>
          </div>
        </div>
      </div>
      {/* Render the menu using the portal */}
      {menuPortal(
        <LinearConfigMenu menuProps={menuProps} mutationProps={mutationProps} teamId={teamId} />
      )}
    </>
  )
}

export default LinearProviderRow
