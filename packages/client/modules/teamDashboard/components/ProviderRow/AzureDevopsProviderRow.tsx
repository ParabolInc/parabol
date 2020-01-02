import {AzureDevopsProviderRow_viewer} from '../../../../__generated__/AzureDevopsProviderRow_viewer.graphql'
import jwtDecode from 'jwt-decode'
import React, {useEffect} from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import FlatButton from '../../../../components/FlatButton'
import Icon from '../../../../components/Icon'
import AzureDevopsConfigMenu from '../../../../components/AzureDevopsConfigMenu'
import LoadingComponent from '../../../../components/LoadingComponent/LoadingComponent'
import ProviderCard from '../../../../components/ProviderCard'
import ProviderActions from '../../../../components/ProviderActions'
import RowInfo from '../../../../components/Row/RowInfo'
import RowInfoCopy from '../../../../components/Row/RowInfoCopy'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../../decorators/withAtmosphere/withAtmosphere'
import useAzureDevopsAccounts from '../../../../hooks/useAzureDevopsAccounts'
import {MenuPosition} from '../../../../hooks/useCoords'
import useMenu from '../../../../hooks/useMenu'
import {DECELERATE, fadeIn} from '../../../../styles/animation'
import {PALETTE} from '../../../../styles/paletteV2'
import {ICON_SIZE} from '../../../../styles/typographyV2'
import {Breakpoint, Providers} from '../../../../types/constEnums'
import withMutationProps, {WithMutationProps} from '../../../../utils/relay/withMutationProps'
import AzureDevopsProviderLogo from '../../../../AzureDevopsProviderLogo'
import {MenuMutationProps} from '../../../../hooks/useMutationProps'
import AzureDevopsClientManager from '../../../../utils/AzureDevopsClientManager'
import useBreakpoint from '../../../../hooks/useBreakpoint'
import AuthToken from 'parabol-server/database/types/AuthToken'

const StyledButton = styled(FlatButton)({
  borderColor: PALETTE.BORDER_LIGHT,
  color: PALETTE.TEXT_MAIN,
  fontSize: 14,
  fontWeight: 600,
  minWidth: 36,
  paddingLeft: 0,
  paddingRight: 0,
  width: '100%'
})

interface Props extends WithAtmosphereProps, WithMutationProps, RouteComponentProps<{}> {
  teamId: string
  retry: () => void
  viewer: AzureDevopsProviderRow_viewer
}

const useFreshToken = (accessToken: string | undefined, retry: () => void) => {
  useEffect(() => {
    if (!accessToken) return
    const decodedToken = jwtDecode(accessToken) as AuthToken | null
    const delay = (decodedToken && decodedToken.exp * 1000 - Date.now()) || -1
    if (delay <= 0) return
    const cancel = window.setTimeout(() => {
      retry()
    }, delay)
    return () => {
      window.clearTimeout(cancel)
    }
  }, [accessToken, retry])
}

const MenuButton = styled(FlatButton)({
  color: PALETTE.PRIMARY_MAIN,
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

const SiteList = styled('div')({})

const SiteAvatar = styled('img')<{idx: number}>(({idx}) => ({
  animationName: fadeIn.toString(),
  animationDuration: '300ms',
  animationTimingFunction: DECELERATE,
  animationDelay: `${idx * 100}ms`,
  animationIterationCount: 1,
  borderRadius: '100%',
  marginLeft: 8,
  opacity: 0
}))

const ProviderName = styled('div')({
  color: PALETTE.TEXT_MAIN,
  fontSize: 16,
  fontWeight: 600,
  lineHeight: '24px',
  alignItems: 'center',
  display: 'flex',
  marginRight: 16,
  verticalAlign: 'middle'
})

const AzureDevopsProviderRow = (props: Props) => {
  const {
    atmosphere,
    retry,
    viewer,
    teamId,
    submitting,
    submitMutation,
    onError,
    onCompleted
  } = props
  const mutationProps = {submitting, submitMutation, onError, onCompleted} as MenuMutationProps
  const {azureDevopsAuth} = viewer
  const accessToken = (azureDevopsAuth && azureDevopsAuth.accessToken) || undefined
  useFreshToken(accessToken, retry)

  const openOAuth = () => {
    AzureDevopsClientManager.openOAuth(atmosphere, teamId, mutationProps)
  }

  const {accounts, status} = useAzureDevopsAccounts(accessToken)
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)
  return (
    <ProviderCard>
      <AzureDevopsProviderLogo />
      <RowInfo>
        <ProviderName>{Providers.AZUREDEVOPS_NAME}</ProviderName>
        <RowInfoCopy>{Providers.AZUREDEVOPS_DESC}</RowInfoCopy>
      </RowInfo>
      {!accessToken && (
        <ProviderActions>
          <StyledButton key='linkAccount' onClick={openOAuth} palette='warm' waiting={submitting}>
            {isDesktop ? 'Connect' : <Icon>add</Icon>}
          </StyledButton>
        </ProviderActions>
      )}
      {accessToken && (
        <ListAndMenu>
          <SiteList>
            {status === 'loaded' &&
              accounts.map((account, idx) => (
                <SiteAvatar
                  key={account.AccountId}
                  width={24}
                  height={24}
                  src={account.NamespaceId}
                  title={account.AccountName}
                  idx={accounts.length - idx}
                />
              ))}
            {status === 'loading' && (
              <LoadingComponent spinnerSize={24} height={24} showAfter={0} />
            )}
          </SiteList>
          <MenuButton onClick={togglePortal} ref={originRef}>
            <StyledIcon>more_vert</StyledIcon>
          </MenuButton>
          {menuPortal(
            <AzureDevopsConfigMenu
              mutationProps={mutationProps}
              menuProps={menuProps}
              teamId={teamId}
            />
          )}
        </ListAndMenu>
      )}
    </ProviderCard>
  )
}

graphql`
  fragment AzureDevopsProviderRowViewer on User {
    azureDevopsAuth(teamId: $teamId) {
      accessToken
    }
  }
`

export default createFragmentContainer(
  withAtmosphere(withMutationProps(withRouter(AzureDevopsProviderRow))),
  {
    viewer: graphql`
      fragment AzureDevopsProviderRow_viewer on User {
        ...AzureDevopsProviderRowViewer @relay(mask: false)
      }
    `
  }
)
