import {SlackProviderRow_viewer} from '__generated__/SlackProviderRow_viewer.graphql'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import FlatButton from 'universal/components/FlatButton'
import SlackConfigMenu from 'universal/components/SlackConfigMenu'
import SlackProviderLogo from 'universal/components/SlackProviderLogo'
import SlackSVG from 'universal/components/SlackSVG'
import Icon from 'universal/components/Icon'
import ProviderCard from 'universal/components/ProviderCard'
import RowActions from 'universal/components/Row/RowActions'
import RowInfo from 'universal/components/Row/RowInfo'
import RowInfoCopy from 'universal/components/Row/RowInfoCopy'
import {MenuPosition} from 'universal/hooks/useCoords'
import useMenu from 'universal/hooks/useMenu'
import {PALETTE} from 'universal/styles/paletteV2'
import {ICON_SIZE} from 'universal/styles/typographyV2'
import {Layout, Providers} from 'universal/types/constEnums'
import useMutationProps, {MenuMutationProps} from 'universal/hooks/useMutationProps'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import SlackClientManager from 'universal/utils/SlackClientManager'
import SlackNotificationList from 'universal/modules/teamDashboard/components/ProviderRow/SlackNotificationList'

const StyledButton = styled(FlatButton)({
  borderColor: PALETTE.BORDER.LIGHT,
  color: PALETTE.TEXT.MAIN,
  fontSize: 14,
  fontWeight: 600,
  paddingLeft: 0,
  paddingRight: 0,
  width: '100%'
})

const ProviderActions = styled(RowActions)({
  marginLeft: 'auto',
  paddingLeft: Layout.ROW_GUTTER,
  maxWidth: '10rem'
})

interface Props {
  teamId: string
  viewer: SlackProviderRow_viewer
}

const MenuButton = styled(FlatButton)({
  color: PALETTE.PRIMARY.MAIN,
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

const SlackLogin = styled('div')({})

const ProviderName = styled('div')({
  color: PALETTE.TEXT.MAIN,
  fontSize: 18,
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

const SlackProviderRow = (props: Props) => {
  const {viewer, teamId} = props
  const atmosphere = useAtmosphere()
  const {submitting, submitMutation, onError, onCompleted} = useMutationProps()
  const mutationProps = {submitting, submitMutation, onError, onCompleted} as MenuMutationProps
  const {slackAuth} = viewer
  const accessToken = (slackAuth && slackAuth.accessToken) || undefined
  const openOAuth = () => {
    SlackClientManager.openOAuth(atmosphere, teamId, mutationProps)
  }
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)
  return (
    <ExtraProviderCard>
      <CardTop>
        <SlackProviderLogo />
        <RowInfo>
          <ProviderName>{Providers.SLACK_NAME}</ProviderName>
          <RowInfoCopy>{Providers.SLACK_DESC}</RowInfoCopy>
        </RowInfo>
        {!accessToken && (
          <ProviderActions>
            <StyledButton onClick={openOAuth} palette='warm' waiting={submitting}>
              {'Connect'}
            </StyledButton>
          </ProviderActions>
        )}
        {accessToken && (
          <ListAndMenu>
            <SlackLogin title={slackAuth.slackTeamName || 'Slack'}>
              <SlackSVG />
            </SlackLogin>
            <MenuButton onClick={togglePortal} innerRef={originRef}>
              <StyledIcon>more_vert</StyledIcon>
            </MenuButton>
            {menuPortal(
              <SlackConfigMenu
                menuProps={menuProps}
                mutationProps={mutationProps}
                teamId={teamId}
              />
            )}
          </ListAndMenu>
        )}
      </CardTop>
      {accessToken && <SlackNotificationList teamId={teamId} viewer={viewer} />}
    </ExtraProviderCard>
  )
}

graphql`
  fragment SlackProviderRowViewer on User {
    ...SlackNotificationList_viewer
    slackAuth(teamId: $teamId) {
      accessToken
      slackTeamName
      slackUserName
    }
  }
`

export default createFragmentContainer(
  SlackProviderRow,
  graphql`
    fragment SlackProviderRow_viewer on User {
      ...SlackProviderRowViewer @relay(mask: false)
    }
  `
)
