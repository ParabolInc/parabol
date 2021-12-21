import React, {useState} from 'react'
import styled from '@emotion/styled'
import {useFragment} from 'react-relay'
import {MattermostProviderRow_viewer$key} from '~/__generated__/MattermostProviderRow_viewer.graphql'
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
import MattermostPanel from './MattermostPanel'
import MattermostProviderLogo from '../../../../components/MattermostProviderLogo'
import MattermostSVG from '../../../../components/MattermostSVG'
import MattermostConfigMenu from './MattermostConfigMenu'

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
  viewerRef: MattermostProviderRow_viewer$key
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

const MattermostLogin = styled('div')({})

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

const MattermostProviderRow = (props: Props) => {
  const {viewerRef, teamId} = props
  const viewer = useFragment(
    graphql`
      fragment MattermostProviderRow_viewer on User {
        ...MattermostPanel_viewer
        teamMember(teamId: $teamId) {
          integrations {
            mattermost {
              isActive
            }
          }
        }
      }
    `,
    viewerRef
  )
  const {submitting, submitMutation, onError, onCompleted} = useMutationProps()
  const mutationProps = {submitting, submitMutation, onError, onCompleted} as MenuMutationProps
  const {teamMember} = viewer
  const {integrations} = teamMember!
  const {mattermost} = integrations
  const [isConnectClicked, setConnectClicked] = useState(false)
  const isActive = mattermost?.isActive
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  return (
    <ExtraProviderCard>
      <CardTop>
        <MattermostProviderLogo />
        <RowInfo>
          <ProviderName>{Providers.MATTERMOST_NAME}</ProviderName>
          <RowInfoCopy>{Providers.MATTERMOST_DESC}</RowInfoCopy>
        </RowInfo>
        {isActive ? (
          <ListAndMenu>
            <MattermostLogin title='Mattermost'>
              <MattermostSVG />
            </MattermostLogin>
            <MenuButton onClick={togglePortal} ref={originRef}>
              <StyledIcon>more_vert</StyledIcon>
            </MenuButton>
            {menuPortal(
              <MattermostConfigMenu
                menuProps={menuProps}
                mutationProps={mutationProps}
                teamId={teamId}
              />
            )}
          </ListAndMenu>
        ) : (
          <ProviderActions>
            <StyledButton
              onClick={() => setConnectClicked(!isConnectClicked)}
              palette='warm'
              waiting={submitting}
            >
              {!isConnectClicked && (isDesktop ? 'Connect' : <Icon>add</Icon>)}
              {isConnectClicked && (isDesktop ? 'Cancel' : <Icon>close</Icon>)}
            </StyledButton>
          </ProviderActions>
        )}
      </CardTop>
      {(isActive || isConnectClicked) && <MattermostPanel teamId={teamId} viewerRef={viewer} />}
    </ExtraProviderCard>
  )
}

export default MattermostProviderRow
