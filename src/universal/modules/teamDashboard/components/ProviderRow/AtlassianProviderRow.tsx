import {AtlassianProviderRow_projects} from '__generated__/AtlassianProviderRow_projects.graphql'
import {decode} from 'jsonwebtoken'
import React, {useEffect} from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import {Link, RouteComponentProps, withRouter} from 'react-router-dom'
import FlatButton from 'universal/components/FlatButton'
import Row from 'universal/components/Row/Row'
import RowActions from 'universal/components/Row/RowActions'
import RowInfo from 'universal/components/Row/RowInfo'
import RowInfoCopy from 'universal/components/Row/RowInfoCopy'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import {PALETTE} from 'universal/styles/paletteV2'
import ui from 'universal/styles/ui'
import {IAuthToken, IntegrationServiceEnum} from 'universal/types/graphql'
import handleOpenOAuth from 'universal/utils/handleOpenOAuth'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import AtlassianProviderLogo from '../../../../AtlassianProviderLogo'
import ProviderRowName from './ProviderRowName'

const StyledButton = styled(FlatButton)({
  borderColor: PALETTE.BORDER.LIGHT,
  color: PALETTE.TEXT.MAIN,
  fontSize: 14,
  fontWeight: 600,
  paddingLeft: 0,
  paddingRight: 0,
  width: '100%'
})

const StyledRow = styled(Row)({
  justifyContent: 'flex-start'
})

const AtlassianAvatar = styled('div')({
  backgroundColor: '#0052cc',
  borderRadius: ui.providerIconBorderRadius
})

const ProviderActions = styled(RowActions)({
  marginLeft: 'auto',
  paddingLeft: ui.rowGutter,
  maxWidth: '10rem'
})

interface Props extends WithAtmosphereProps, WithMutationProps, RouteComponentProps<{}> {
  isAuthed: boolean
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

const AtlassianProviderRow = (props: Props) => {
  const {atmosphere, teamId, submitting, submitMutation, onError, onCompleted, isAuthed} = props
  const {retry, viewer} = props
  const {atlassianAuth} = viewer
  const accessToken = (atlassianAuth && atlassianAuth.accessToken) || undefined
  useFreshToken(accessToken, retry)
  const openOAuth = handleOpenOAuth({
    name: IntegrationServiceEnum.atlassian,
    submitting,
    submitMutation,
    atmosphere,
    onError,
    onCompleted,
    teamId
  })
  return (
    <StyledRow>
      <AtlassianAvatar>
        <AtlassianProviderLogo />
      </AtlassianAvatar>
      <RowInfo>
        <ProviderRowName name='Atlassian' />
        <RowInfoCopy>{'Create Jira issues from Parabol'}</RowInfoCopy>
      </RowInfo>
      {!isAuthed && (
        <ProviderActions>
          <StyledButton key='linkAccount' onClick={openOAuth} palette='warm' waiting={submitting}>
            {'Connect'}
          </StyledButton>
        </ProviderActions>
      )}
    </StyledRow>
  )
}

graphql`
  fragment AtlassianProviderRowViewer on User {
    ...JiraIntegrationHeader_viewer
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
