import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import useTooltip from 'parabol-client/hooks/useTooltip'
import React from 'react'
import {useFragment} from 'react-relay'
import FlatButton from '../../../../components/FlatButton'
import GitLabProviderLogo from '../../../../components/GitLabProviderLogo'
import GitLabSVG from '../../../../components/GitLabSVG'
import Icon from '../../../../components/Icon'
import ProviderActions from '../../../../components/ProviderActions'
import ProviderCard from '../../../../components/ProviderCard'
import RowInfo from '../../../../components/Row/RowInfo'
import RowInfoCopy from '../../../../components/Row/RowInfoCopy'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useBreakpoint from '../../../../hooks/useBreakpoint'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import useMutationProps from '../../../../hooks/useMutationProps'
import {PALETTE} from '../../../../styles/paletteV3'
import {ICON_SIZE} from '../../../../styles/typographyV2'
import {Breakpoint} from '../../../../types/constEnums'
import GitLabClientManager from '../../../../utils/GitLabClientManager'
import {GitLabProviderRow_viewer$key} from '../../../../__generated__/GitLabProviderRow_viewer.graphql'
import GitLabConfigMenu from './GitLabConfigMenu'

const StyledButton = styled(FlatButton)({
  color: PALETTE.SLATE_700,
  fontSize: 14,
  fontWeight: 600,
  minWidth: 36,
  paddingLeft: 0,
  paddingRight: 0,
  width: '100%'
})

const StyledPrimaryButton = styled(StyledButton)({
  borderColor: PALETTE.SLATE_400
})

interface Props {
  teamId: string
  viewerRef: GitLabProviderRow_viewer$key
}

const MenuButton = styled(FlatButton)({
  color: PALETTE.GRAPE_700,
  fontSize: ICON_SIZE.MD18,
  height: 24,
  userSelect: 'none',
  marginLeft: 4,
  padding: 0,
  width: 24
})

const StyledIcon = styled(Icon)({
  fontSize: ICON_SIZE.MD18
})

const ListAndMenu = styled('div')({
  display: 'flex',
  position: 'absolute',
  right: 16,
  top: 16
})

const GitLabLogin = styled('div')({})

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

graphql`
  fragment GitLabProviderRowTeamMember on TeamMember {
    integrations {
      gitlab {
        auth {
          provider {
            scope
          }
        }
        cloudProvider {
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
  const {
    openTooltip: cloudOpenTooltip,
    closeTooltip: cloudCloseTooltip,
    originRef: cloudRef
  } = useTooltip<HTMLButtonElement>(MenuPosition.LOWER_CENTER)

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
  const {auth, cloudProvider} = gitlab
  if (!cloudProvider) return null
  const {clientId, id: cloudProviderId, serverBaseUrl} = cloudProvider
  return (
    <ProviderCard>
      <GitLabProviderLogo />
      <RowInfo>
        <ProviderName>GitLab</ProviderName>
        <RowInfoCopy>Use GitLab Issues from within Parabol</RowInfoCopy>
      </RowInfo>
      {!auth && (
        <ProviderActions>
          <StyledPrimaryButton
            onClick={() => openOAuth(cloudProviderId, clientId, serverBaseUrl)}
            palette='warm'
            waiting={submitting}
            onMouseOver={cloudOpenTooltip}
            onMouseOut={cloudCloseTooltip}
            ref={cloudRef}
          >
            {isDesktop ? 'Connect' : <Icon>add</Icon>}
          </StyledPrimaryButton>
        </ProviderActions>
      )}
      {auth && (
        <ListAndMenu>
          <GitLabLogin title={auth.provider.scope === 'global' ? 'Cloud' : 'Self-hosted'}>
            <GitLabSVG />
          </GitLabLogin>
          <MenuButton onClick={togglePortal} ref={menuRef}>
            <StyledIcon>more_vert</StyledIcon>
          </MenuButton>
          {menuPortal(
            <GitLabConfigMenu menuProps={menuProps} mutationProps={mutationProps} teamId={teamId} />
          )}
        </ListAndMenu>
      )}
    </ProviderCard>
  )
}

export default GitLabProviderRow
