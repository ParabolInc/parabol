import {AtlassianProviderRow_viewer} from '__generated__/AtlassianProviderRow_viewer.graphql'
import {decode} from 'jsonwebtoken'
import React, {useEffect} from 'react'
import styled, {keyframes} from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import FlatButton from 'universal/components/FlatButton'
import Icon from 'universal/components/Icon'
import AtlassianConfigMenu from 'universal/components/AtlassianConfigMenu'
import LoadingComponent from 'universal/components/LoadingComponent/LoadingComponent'
import ProviderCard from 'universal/components/ProviderCard'
import RowActions from 'universal/components/Row/RowActions'
import RowInfo from 'universal/components/Row/RowInfo'
import RowInfoCopy from 'universal/components/Row/RowInfoCopy'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import useAtlassianSites from 'universal/hooks/useAtlassianSites'
import {MenuPosition} from 'universal/hooks/useCoords'
import useMenu from 'universal/hooks/useMenu'
import {DECELERATE} from 'universal/styles/animation'
import {PALETTE} from 'universal/styles/paletteV2'
import {ICON_SIZE} from 'universal/styles/typographyV2'
import {Layout, Providers} from 'universal/types/constEnums'
import {IAuthToken, IntegrationServiceEnum} from 'universal/types/graphql'
import handleOpenOAuth from 'universal/utils/handleOpenOAuth'
import withMutationProps, {
  MenuMutationProps,
  WithMutationProps
} from 'universal/utils/relay/withMutationProps'
import AtlassianProviderLogo from 'universal/AtlassianProviderLogo'

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

interface Props extends WithAtmosphereProps, WithMutationProps, RouteComponentProps<{}> {
  teamId: string
  retry: () => void
  viewer: AtlassianProviderRow_viewer
}

const useFreshToken = (accessToken: string | undefined, retry: () => void) => {
  useEffect(() => {
    if (!accessToken) return
    const decodedToken = decode(accessToken) as IAuthToken | null
    const delay = (decodedToken && decodedToken.exp * 1000 - Date.now()) || -1
    if (delay <= 0) return
    const cancel = window.setTimeout(() => {
      retry()
    }, delay)
    return () => {
      window.clearTimeout(cancel)
    }
  }, [accessToken])
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

const SiteList = styled('div')({})

const fadeIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(0);
  }
	100% {
	  opacity: 1;
	  transform: scale(1);
	}
`

const SiteAvatar = styled('img')(({idx}: {idx: number}) => ({
  animation: `${fadeIn} 300ms ${DECELERATE} ${idx * 50}ms forwards`,
  animationName: fadeIn,
  animationDuration: '300ms',
  animationTimingFunction: DECELERATE,
  animationDelay: `${idx * 100}ms`,
  animationIterationCount: 1,
  borderRadius: '100%',
  marginLeft: 8,
  opacity: 0
}))

const ProviderName = styled('div')({
  color: PALETTE.TEXT.MAIN,
  fontSize: 18,
  lineHeight: '24px',
  alignItems: 'center',
  display: 'flex',
  marginRight: 16,
  verticalAlign: 'middle'
})

const AtlassianProviderRow = (props: Props) => {
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
  const {atlassianAuth} = viewer
  const accessToken = (atlassianAuth && atlassianAuth.accessToken) || undefined
  useFreshToken(accessToken, retry)
  const openOAuth = handleOpenOAuth({
    name: IntegrationServiceEnum.atlassian,
    atmosphere,
    teamId,
    ...mutationProps
  })
  const {sites, status} = useAtlassianSites(accessToken)
  const {togglePortal, originRef, menuPortal, menuProps} = useMenu(MenuPosition.UPPER_RIGHT)
  return (
    <ProviderCard>
      <AtlassianProviderLogo />
      <RowInfo>
        <ProviderName>{Providers.ATLASSIAN_NAME}</ProviderName>
        <RowInfoCopy>{Providers.ATLASSIAN_DESC}</RowInfoCopy>
      </RowInfo>
      {!accessToken && (
        <ProviderActions>
          <StyledButton key='linkAccount' onClick={openOAuth} palette='warm' waiting={submitting}>
            {'Connect'}
          </StyledButton>
        </ProviderActions>
      )}
      {accessToken && (
        <ListAndMenu>
          <SiteList>
            {status === 'loaded' &&
              sites.map((site, idx) => (
                <SiteAvatar
                  key={site.id}
                  width={24}
                  height={24}
                  src={site.avatarUrl}
                  title={site.name}
                  idx={sites.length - idx}
                />
              ))}
            {status === 'loading' && (
              <LoadingComponent spinnerSize={24} height={24} showAfter={0} />
            )}
          </SiteList>
          <MenuButton onClick={togglePortal} innerRef={originRef}>
            <StyledIcon>more_vert</StyledIcon>
          </MenuButton>
          {menuPortal(
            <AtlassianConfigMenu
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
  fragment AtlassianProviderRowViewer on User {
    atlassianAuth(teamId: $teamId) {
      accessToken
    }
  }
`

export default createFragmentContainer(
  withAtmosphere(withMutationProps(withRouter(AtlassianProviderRow))),
  graphql`
    fragment AtlassianProviderRow_viewer on User {
      ...AtlassianProviderRowViewer @relay(mask: false)
    }
  `
)
