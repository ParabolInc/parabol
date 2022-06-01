import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useState} from 'react'
import {useFragment} from 'react-relay'
import {MSTeamsProviderRow_viewer$key} from '~/__generated__/MSTeamsProviderRow_viewer.graphql'
import FlatButton from '../../../../components/FlatButton'
import Icon from '../../../../components/Icon'
import MSTeamsProviderLogo from '../../../../components/MSTeamsProviderLogo'
import MSTeamsSVG from '../../../../components/MSTeamsSVG'
import ProviderActions from '../../../../components/ProviderActions'
import ProviderCard from '../../../../components/ProviderCard'
import RowInfo from '../../../../components/Row/RowInfo'
import RowInfoCopy from '../../../../components/Row/RowInfoCopy'
import useBreakpoint from '../../../../hooks/useBreakpoint'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import useMutationProps, {MenuMutationProps} from '../../../../hooks/useMutationProps'
import {PALETTE} from '../../../../styles/paletteV3'
import {ICON_SIZE} from '../../../../styles/typographyV2'
import {Breakpoint, Layout, Providers} from '../../../../types/constEnums'
import MSTeamsConfigMenu from './MSTeamsConfigMenu'
import MSTeamsPanel from './MSTeamsPanel'

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
  viewerRef: MSTeamsProviderRow_viewer$key
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

const MSTeamsLogin = styled('div')({})

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
  fragment MSTeamsProviderRowTeamMember on TeamMember {
    integrations {
      msTeams {
        auth {
          provider {
            id
          }
        }
      }
    }
  }
`
const MSTeamsProviderRow = (props: Props) => {
  const {viewerRef, teamId} = props
  const viewer = useFragment(
    graphql`
      fragment MSTeamsProviderRow_viewer on User {
        ...MSTeamsPanel_viewer
        teamMember(teamId: $teamId) {
          ...MSTeamsProviderRowTeamMember @relay(mask: false)
        }
      }
    `,
    viewerRef
  )
  const [isConnectClicked, setConnectClicked] = useState(false)
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  const {submitting, submitMutation, onError, onCompleted} = useMutationProps()
  const mutationProps = {submitting, submitMutation, onError, onCompleted} as MenuMutationProps
  const {teamMember} = viewer
  const {integrations} = teamMember!
  const {msTeams} = integrations
  const {auth} = msTeams
  return (
    <ExtraProviderCard>
      <CardTop>
        <MSTeamsProviderLogo />
        <RowInfo>
          <ProviderName>{Providers.MSTEAMS_NAME}</ProviderName>
          <RowInfoCopy>{Providers.MSTEAMS_DESC}</RowInfoCopy>
        </RowInfo>
        {auth ? (
          <ListAndMenu>
            <MSTeamsLogin title='MSTeams'>
              <MSTeamsSVG />
            </MSTeamsLogin>
            <MenuButton onClick={togglePortal} ref={originRef}>
              <StyledIcon>more_vert</StyledIcon>
            </MenuButton>
            {menuPortal(
              <MSTeamsConfigMenu
                menuProps={menuProps}
                mutationProps={mutationProps}
                providerId={auth.provider.id}
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
      {(auth || isConnectClicked) && <MSTeamsPanel teamId={teamId} viewerRef={viewer} />}
    </ExtraProviderCard>
  )
}

export default MSTeamsProviderRow
