import {Done as DoneIcon, MoreVert as MoreVertIcon} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {GitLabProviderRow_viewer$key} from '../../../../__generated__/GitLabProviderRow_viewer.graphql'
import FlatButton from '../../../../components/FlatButton'
import GitLabProviderLogo from '../../../../components/GitLabProviderLogo'
import ProviderActions from '../../../../components/ProviderActions'
import RowInfo from '../../../../components/Row/RowInfo'
import RowInfoCopy from '../../../../components/Row/RowInfoCopy'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useBreakpoint from '../../../../hooks/useBreakpoint'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import useMutationProps from '../../../../hooks/useMutationProps'
import {Breakpoint} from '../../../../types/constEnums'
import GitLabClientManager from '../../../../utils/GitLabClientManager'
import ConnectButton from './ConnectButton'
import GitLabConfigMenu from './GitLabConfigMenu'

interface Props {
  teamId: string
  viewerRef: GitLabProviderRow_viewer$key
}

graphql`
  fragment GitLabProviderRowTeamMember on TeamMember {
    integrations {
      gitlab {
        auth {
          provider {
            id
            scope
          }
        }
        cloudProvider {
          id
          clientId
          serverBaseUrl
        }
        sharedProviders {
          id
          clientId
          serverBaseUrl
        }
      }
    }
  }
`

const GitLabProviderRow = (props: Props) => {
  const {teamId, viewerRef} = props
  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()
  const {submitting, error} = mutationProps
  const openOAuth = (providerId: string, clientId: string, serverBaseUrl: string) => {
    GitLabClientManager.openOAuth(
      atmosphere,
      providerId,
      clientId,
      serverBaseUrl,
      teamId,
      mutationProps
    )
  }
  const {
    originRef: menuRef,
    menuPortal,
    menuProps,
    togglePortal
  } = useMenu(MenuPosition.UPPER_RIGHT)
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)

  const viewer = useFragment(
    graphql`
      fragment GitLabProviderRow_viewer on User {
        teamMember(teamId: $teamId) {
          ...GitLabProviderRowTeamMember @relay(mask: false)
        }
      }
    `,
    viewerRef
  )
  const {teamMember} = viewer
  const {integrations} = teamMember!
  const {gitlab} = integrations
  const {auth, cloudProvider, sharedProviders} = gitlab
  const connected = !!auth
  const connectedProviderId = auth?.provider?.id
  const availableProviders = [...(cloudProvider ? [cloudProvider] : []), ...sharedProviders]

  if (availableProviders.length === 0) return null

  return (
    <>
      <div className='relative my-4 flex w-full shrink-0 flex-col justify-start rounded-sm bg-white shadow-card'>
        <div className='flex justify-start p-row-gutter pb-0'>
          <GitLabProviderLogo />
          <div className='flex w-full flex-col'>
            {availableProviders.map(({id, serverBaseUrl, clientId}) => {
              const showProvider = !connected || id === connectedProviderId
              const isCloudProvider = cloudProvider?.id === id
              if (!showProvider) return null
              return (
                <div key={id} className='flex w-full flex-row pb-4'>
                  <RowInfo>
                    <div className='mr-4 flex items-center align-middle leading-6 font-semibold text-slate-700'>
                      {isCloudProvider ? 'GitLab' : serverBaseUrl.replace(/https:\/\//, '')}
                    </div>
                    <RowInfoCopy>
                      {isCloudProvider
                        ? 'Use GitLab Issues from within Parabol.'
                        : 'Connect to your own GitLab server.'}
                    </RowInfoCopy>
                    {!!error?.message && (
                      <div className='text-sm text-tomato-500 [&_a]:font-semibold [&_a]:text-tomato-500 [&_a]:underline'>
                        {error.message}
                      </div>
                    )}
                  </RowInfo>
                  <ProviderActions>
                    {!connected && (
                      <ConnectButton
                        onConnectClick={() => openOAuth(id, clientId, serverBaseUrl)}
                        submitting={submitting}
                      />
                    )}
                    {id === connectedProviderId && (
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
                              className='min-w-[30px] border-slate-400 pr-0 pl-0 text-sm font-semibold text-slate-700'
                              onClick={togglePortal}
                              ref={menuRef}
                            >
                              <MoreVertIcon className='h-[18px] w-[18px] text-lg' />
                            </FlatButton>
                          </>
                        ) : (
                          <FlatButton
                            className='min-w-[36px] border-slate-400 pr-0 pl-0 text-sm font-semibold text-slate-700'
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
              )
            })}
          </div>
        </div>
      </div>
      {menuPortal(
        <GitLabConfigMenu menuProps={menuProps} mutationProps={mutationProps} teamId={teamId} />
      )}
    </>
  )
}

export default GitLabProviderRow
