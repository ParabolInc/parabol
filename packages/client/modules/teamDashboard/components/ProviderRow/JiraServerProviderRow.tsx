import React from 'react'
import styled from '@emotion/styled'
import {useFragment} from 'react-relay'
import {JiraServerProviderRow_viewer$key} from '~/__generated__/JiraServerProviderRow_viewer.graphql'
import graphql from 'babel-plugin-relay/macro'
import FlatButton from '../../../../components/FlatButton'
import Icon from '../../../../components/Icon'
import ProviderCard from '../../../../components/ProviderCard'
import ProviderActions from '../../../../components/ProviderActions'
import RowInfo from '../../../../components/Row/RowInfo'
import RowInfoCopy from '../../../../components/Row/RowInfoCopy'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import {PALETTE} from '../../../../styles/paletteV3'
import {ICON_SIZE} from '../../../../styles/typographyV2'
import {Breakpoint, Layout, Providers} from '../../../../types/constEnums'
import useMutationProps, {MenuMutationProps} from '../../../../hooks/useMutationProps'
import useBreakpoint from '../../../../hooks/useBreakpoint'
import JiraServerProviderLogo from '../../../../components/JiraServerProviderLogo'
import JiraServerSVG from '../../../../components/JiraServerSVG'
import JiraServerClientManager from '../../../../utils/JiraServerClientManager'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import JiraServerConfigMenu from '../../../../components/JiraServerConfigMenu'

const StyledButton = styled(FlatButton)({
  borderColor: PALETTE.SLATE_400,
  color: PALETTE.SLATE_700,
  fontSize: 14,
  fontWeight: 600,
  minWidth: 36,
  paddingLeft: 0,
  paddingRight: 0,
  width: '100%'
})

interface Props {
  teamId: string
  viewerRef: JiraServerProviderRow_viewer$key
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

const JiraServerLogin = styled('div')({})

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

const CardTop = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  padding: Layout.ROW_GUTTER
})

const ExtraProviderCard = styled(ProviderCard)({
  flexDirection: 'column',
  padding: 0
})

graphql`
  fragment JiraServerProviderRowTeamMember on TeamMember {
    integrations {
      jiraServer {
        auth {
          id
          isActive
        }
        sharedProviders {
          id
        }
      }
    }
  }
`

const JiraServerProviderRow = (props: Props) => {
  const {viewerRef, teamId} = props
  const viewer = useFragment(
    graphql`
      fragment JiraServerProviderRow_viewer on User {
        teamMember(teamId: $teamId) {
          ...JiraServerProviderRowTeamMember @relay(mask: false)
        }
      }
    `,
    viewerRef
  )
  const atmosphere = useAtmosphere()
  const {submitting, submitMutation, onError, onCompleted} = useMutationProps()
  const mutationProps = {submitting, submitMutation, onError, onCompleted} as MenuMutationProps
  const {teamMember} = viewer
  const {integrations} = teamMember!
  const {jiraServer} = integrations
  const isActive = !!jiraServer?.auth?.isActive
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const provider = jiraServer?.sharedProviders[0]

  if (!provider) return null

  const openOAuth = () => {
    JiraServerClientManager.openOAuth(atmosphere, provider.id, teamId, mutationProps)
  }

  return (
    <ExtraProviderCard>
      <CardTop>
        <JiraServerProviderLogo />
        <RowInfo>
          <ProviderName>{Providers.JIRA_SERVER_NAME}</ProviderName>
          <RowInfoCopy>{Providers.JIRA_SERVER_DESC}</RowInfoCopy>
        </RowInfo>
        {isActive ? (
          <ListAndMenu>
            <JiraServerLogin title='JiraServer'>
              <JiraServerSVG />
            </JiraServerLogin>
            <MenuButton onClick={togglePortal} ref={originRef}>
              <StyledIcon>more_vert</StyledIcon>
            </MenuButton>
            {menuPortal(
              <JiraServerConfigMenu
                menuProps={menuProps}
                mutationProps={mutationProps}
                teamId={teamId}
                providerId={provider.id}
              />
            )}
          </ListAndMenu>
        ) : (
          <ProviderActions>
            <StyledButton key='linkAccount' onClick={openOAuth} palette='warm' waiting={submitting}>
              {isDesktop ? 'Connect' : <Icon>add</Icon>}
            </StyledButton>
          </ProviderActions>
        )}
      </CardTop>
    </ExtraProviderCard>
  )
}

export default JiraServerProviderRow
