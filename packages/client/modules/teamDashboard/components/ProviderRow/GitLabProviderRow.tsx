import styled from '@emotion/styled'
import {Done as DoneIcon, MoreVert as MoreVertIcon} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
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
import {cardShadow} from '../../../../styles/elevation'
import {PALETTE} from '../../../../styles/paletteV3'
import {Breakpoint, Layout} from '../../../../types/constEnums'
import GitLabClientManager from '../../../../utils/GitLabClientManager'
import ConnectButton from './ConnectButton'
import GitLabConfigMenu from './GitLabConfigMenu'

const MenuButton = styled(FlatButton)({
  borderColor: PALETTE.SLATE_400,
  color: PALETTE.SLATE_700,
  fontSize: 14,
  fontWeight: 600,
  minWidth: 36,
  paddingLeft: 0,
  paddingRight: 0
})

const SmallMenuButton = styled(MenuButton)({
  minWidth: 30
})

const StatusWrapper = styled('div')({
  display: 'flex',
  alignItems: 'center',
  paddingRight: 25
})

const StatusLabel = styled('div')({
  color: PALETTE.SLATE_700,
  fontSize: 14,
  fontWeight: 600,
  paddingLeft: 6
})

const StatusIcon = styled('div')({
  svg: {
    fontSize: 18
  },
  width: 18,
  height: 18,
  color: PALETTE.SUCCESS_LIGHT
})

const MenuSmallIcon = styled(MoreVertIcon)({
  svg: {
    fontSize: 18
  },
  width: 18,
  height: 18
})

const ProviderName = styled('div')({
  color: PALETTE.SLATE_700,
  fontSize: 16,
  fontWeight: 600,
  lineHeight: '24px',
  alignItems: 'center',
  display: 'flex',
  marginRight: 16,
  verticalAlign: 'middle'
})

const ProviderCard = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'white',
  borderRadius: 4,
  boxShadow: cardShadow,
  flexShrink: 0,
  justifyContent: 'flex-start',
  margin: '16px 0',
  padding: 0,
  position: 'relative',
  width: '100%'
})

const CardTop = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  padding: Layout.ROW_GUTTER,
  paddingBottom: 0
})

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
  const {submitting} = mutationProps
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
  const showCloudProvider =
    cloudProvider && (!connected || cloudProvider.id === connectedProviderId)

  return (
    <>
      <ProviderCard>
        <CardTop>
          <GitLabProviderLogo />
          <div className='flex w-full flex-col'>
            {showCloudProvider && (
              <div className='flex w-full flex-row pb-4'>
                <RowInfo>
                  <ProviderName>GitLab</ProviderName>
                  <RowInfoCopy>Use GitLab Issues from within Parabol.</RowInfoCopy>
                </RowInfo>
                <ProviderActions>
                  {!connected && (
                    <ConnectButton
                      onConnectClick={() =>
                        openOAuth(
                          cloudProvider.id,
                          cloudProvider.clientId,
                          cloudProvider.serverBaseUrl
                        )
                      }
                      submitting={submitting}
                    />
                  )}
                  {cloudProvider.id === connectedProviderId && (
                    <>
                      {isDesktop ? (
                        <>
                          <StatusWrapper>
                            <StatusIcon>
                              <DoneIcon />
                            </StatusIcon>
                            <StatusLabel>Connected</StatusLabel>
                          </StatusWrapper>
                          <SmallMenuButton onClick={togglePortal} ref={menuRef}>
                            <MenuSmallIcon>
                              <MoreVertIcon />
                            </MenuSmallIcon>
                          </SmallMenuButton>
                        </>
                      ) : (
                        <MenuButton onClick={togglePortal} ref={menuRef}>
                          <MoreVertIcon />
                        </MenuButton>
                      )}
                    </>
                  )}
                </ProviderActions>
              </div>
            )}
            {sharedProviders.map(({id, serverBaseUrl, clientId}) => {
              const showProvider = !connected || id === connectedProviderId
              if (!showProvider) return null
              return (
                <div key={id} className='flex w-full flex-row pb-4'>
                  <RowInfo>
                    <ProviderName>{serverBaseUrl.replace(/https:\/\//, '')}</ProviderName>
                    <RowInfoCopy>Connect to your own GitLab server.</RowInfoCopy>
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
                            <StatusWrapper>
                              <StatusIcon>
                                <DoneIcon />
                              </StatusIcon>
                              <StatusLabel>Connected</StatusLabel>
                            </StatusWrapper>
                            <SmallMenuButton onClick={togglePortal} ref={menuRef}>
                              <MenuSmallIcon>
                                <MoreVertIcon />
                              </MenuSmallIcon>
                            </SmallMenuButton>
                          </>
                        ) : (
                          <MenuButton onClick={togglePortal} ref={menuRef}>
                            <MoreVertIcon />
                          </MenuButton>
                        )}
                      </>
                    )}
                  </ProviderActions>
                </div>
              )
            })}
          </div>
        </CardTop>
      </ProviderCard>
      {menuPortal(
        <GitLabConfigMenu menuProps={menuProps} mutationProps={mutationProps} teamId={teamId} />
      )}
    </>
  )
}

export default GitLabProviderRow
