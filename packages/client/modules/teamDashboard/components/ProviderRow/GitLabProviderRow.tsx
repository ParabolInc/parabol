import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import FlatButton from '../../../../components/FlatButton'
import GitLabProviderLogo from '../../../../components/GitLabProviderLogo'
import GitLabSVG from '../../../../components/GitLabSVG'
import Icon from '../../../../components/Icon'
import ProviderActions from '../../../../components/ProviderActions'
import ProviderCard from '../../../../components/ProviderCard'
import RowInfo from '../../../../components/Row/RowInfo'
import RowInfoCopy from '../../../../components/Row/RowInfoCopy'
import useBreakpoint from '../../../../hooks/useBreakpoint'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import {PALETTE} from '../../../../styles/paletteV3'
import {ICON_SIZE} from '../../../../styles/typographyV2'
import {Breakpoint} from '../../../../types/constEnums'
import GitLabClientManager, {GitLabIntegrationProvider} from '../../../../utils/GitLabClientManager'
import {GitLabProviderRow_viewer$key} from '../../../../__generated__/GitLabProviderRow_viewer.graphql'
import GitLabConfigMenu from './GitLabConfigMenu'
import useTooltip from 'parabol-client/hooks/useTooltip'

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

const StyledSecondaryButton = styled(StyledButton)({
  backgroundColor: PALETTE.SLATE_200,
  marginLeft: 16
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

const GitLabProviderRow = (props: Props) => {
  const {teamId, viewerRef} = props
  const viewer = useFragment(
    graphql`
      fragment GitLabProviderRow_viewer on User {
        teamMember(teamId: $teamId) {
          integrations {
            gitlab {
              availableProviders {
                id
                scope
                tokenType
                name
                updatedAt
                providerMetadata {
                  ... on OAuth2ProviderMetadata {
                    clientId
                    serverBaseUrl
                    scopes
                  }
                }
              }
              activeProvider {
                id
                name
              }
              isActive
              teamId
            }
          }
        }
      }
    `,
    viewerRef
  )
  const {teamMember} = viewer
  const {integrations} = teamMember!
  const {gitlab} = integrations
  const {isActive, availableProviders} = gitlab!
  const atmosphere = useAtmosphere()
  const mutationProps = useMutationProps()
  const {submitting} = mutationProps
  const primaryProvider = GitLabClientManager.getPrimaryProvider(availableProviders)
  const secondaryProvider = GitLabClientManager.getSecondaryProvider(availableProviders)
  const openOAuth = (provider: GitLabIntegrationProvider) => {
    GitLabClientManager.openOAuth(atmosphere, provider, teamId, mutationProps)
  }
  const {
    originRef: menuRef,
    menuPortal,
    menuProps,
    terminatePortal,
    togglePortal
  } = useMenu(MenuPosition.UPPER_RIGHT)
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const primaryProviderName = !secondaryProvider ? 'Connect' : primaryProvider!.name
  const {
    tooltipPortal: primaryTooltipPortal,
    openTooltip: primaryOpenTooltip,
    closeTooltip: primaryCloseTooltip,
    originRef: primaryRef
  } = useTooltip<HTMLDivElement>(MenuPosition.LOWER_CENTER)
  const {
    tooltipPortal: secondaryTooltipPortal,
    openTooltip: secondaryOpenTooltip,
    closeTooltip: secondaryCloseTooltip,
    originRef: secondaryRef
  } = useTooltip<HTMLDivElement>(MenuPosition.LOWER_CENTER)

  return (
    <ProviderCard>
      <GitLabProviderLogo />
      <RowInfo>
        <ProviderName>GitLab</ProviderName>
        <RowInfoCopy>Use GitLab Issues from within Parabol</RowInfoCopy>
      </RowInfo>
      {!isActive && (
        <ProviderActions>
          {primaryProvider && (
            <StyledPrimaryButton
              key='linkAccountToPrimary'
              onClick={() => openOAuth(primaryProvider)}
              palette='warm'
              waiting={submitting}
              onMouseOver={primaryOpenTooltip}
              onMouseOut={primaryCloseTooltip}
              ref={primaryRef as any}
            >
              {isDesktop ? primaryProviderName : <Icon>add</Icon>}
            </StyledPrimaryButton>
          )}
          {primaryProvider && primaryTooltipPortal('Connect to GitLab Cloud')}
          {secondaryProvider && (
            <StyledSecondaryButton
              key='linkAccountToSecondary'
              onClick={() => openOAuth(secondaryProvider)}
              palette='warm'
              waiting={submitting}
              onMouseOver={secondaryOpenTooltip}
              onMouseOut={secondaryCloseTooltip}
              ref={secondaryRef as any}
            >
              {isDesktop ? (
                GitLabClientManager.getTruncatedProviderName(secondaryProvider.name)
              ) : (
                <Icon>enhanced_encryption</Icon>
              )}
            </StyledSecondaryButton>
          )}
          {secondaryProvider &&
            secondaryTooltipPortal(
              `Connect to ${secondaryProvider!.providerMetadata!.serverBaseUrl}`
            )}
        </ProviderActions>
      )}
      {isActive && (
        <ListAndMenu>
          {/* <GitLabLogin title={gitlab!.login}> */}
          <GitLabLogin title={gitlab!.activeProvider!.name}>
            <GitLabSVG />
          </GitLabLogin>
          <MenuButton onClick={togglePortal} ref={menuRef}>
            <StyledIcon>more_vert</StyledIcon>
          </MenuButton>
          {menuPortal(
            <GitLabConfigMenu
              menuProps={menuProps}
              mutationProps={mutationProps}
              providerId={gitlab!.activeProvider!.id}
              teamId={gitlab!.teamId}
              terminatePortal={terminatePortal}
            />
          )}
        </ListAndMenu>
      )}
    </ProviderCard>
  )
}

export default GitLabProviderRow
