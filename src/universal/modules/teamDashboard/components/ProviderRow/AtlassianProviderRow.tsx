import {AtlassianProviderRow_projects} from '__generated__/AtlassianProviderRow_projects.graphql'
import React from 'react'
import styled from 'react-emotion'
import FontAwesome from 'react-fontawesome'
import {createFragmentContainer, graphql} from 'react-relay'
import {Link, RouteComponentProps, withRouter} from 'react-router-dom'
import Icon from 'universal/components/Icon'
import RaisedButton from 'universal/components/RaisedButton'
import Row from 'universal/components/Row/Row'
import RowActions from 'universal/components/Row/RowActions'
import RowInfo from 'universal/components/Row/RowInfo'
import RowInfoCopy from 'universal/components/Row/RowInfoCopy'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import appTheme from 'universal/styles/theme/appTheme'
import ui from 'universal/styles/ui'
import handleOpenOAuth from 'universal/utils/handleOpenOAuth'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import AtlassianProviderLogo from '../../../../AtlassianProviderLogo'

const StyledButton = styled(RaisedButton)({
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

const NameAndMeta = styled('div')({
  display: 'flex',
  alignItems: 'center'
})

const ProviderMeta = styled('div')({
  color: appTheme.palette.mid,
  display: 'inline-block',
  fontSize: 0,
  height: '1rem',
  lineHeight: appTheme.typography.s3,
  padding: '0 0 .125rem 1.5rem',
  verticalAlign: 'middle'
})

const ProviderMetaItem = styled('div')({
  display: 'inline-block',
  fontSize: appTheme.typography.s3,
  fontWeight: 600,
  marginRight: ui.rowGutter
})

const ProviderName = styled('div')({
  ...ui.providerName,
  display: 'inline-block',
  marginRight: ui.rowGutter,
  verticalAlign: 'middle'
})

const ProviderActions = styled(RowActions)({
  marginLeft: 'auto',
  paddingLeft: ui.rowGutter,
  maxWidth: '10rem'
})

const StyledLink = styled(Link)({
  display: 'block',
  textDecoration: 'none'
})

const metaIconStyle = {
  display: 'inline-block',
  fontSize: ui.iconSize,
  fontWeight: 400
}

interface Props extends WithAtmosphereProps, WithMutationProps, RouteComponentProps<{}> {
  projects: AtlassianProviderRow_projects
  isAuthed: boolean
  teamId: string
}

const AtlassianProviderRow = (props: Props) => {
  const {
    atmosphere,
    history,
    teamId,
    submitting,
    submitMutation,
    onError,
    onCompleted,
    projects,
    isAuthed
  } = props
  const to = `/team/${teamId}/settings/integrations/jira`
  const users = new Set(...projects.map((project) => project.teamMembers.userId))
  const openOAuth = handleOpenOAuth({
    name: 'atlassian',
    submitting,
    submitMutation,
    atmosphere,
    onError,
    onCompleted,
    teamId
  })
  return (
    <StyledRow>
      <StyledLink to={to}>
        <AtlassianAvatar>
          <AtlassianProviderLogo />
        </AtlassianAvatar>
      </StyledLink>
      <RowInfo>
        <StyledLink to={to}>
          <NameAndMeta>
            <ProviderName>
              Atlassian
              {projects.length > 0 && (
                <ProviderMeta>
                  <ProviderMetaItem>
                    <FontAwesome name='user-circle' style={metaIconStyle} /> {users.size}
                  </ProviderMetaItem>
                  <ProviderMetaItem>
                    <Icon>extension</Icon> {projects.length}
                  </ProviderMetaItem>
                </ProviderMeta>
              )}
            </ProviderName>
          </NameAndMeta>
          <RowInfoCopy>{'Create JIRA issues from Parabol'}</RowInfoCopy>
        </StyledLink>
      </RowInfo>
      <ProviderActions>
        {isAuthed ? (
          <StyledButton key='teamSettings' onClick={() => history.push(to)}>
            {'Team Settings'}
          </StyledButton>
        ) : (
          <StyledButton key='linkAccount' onClick={openOAuth} palette='warm' waiting={submitting}>
            {'Link My Account'}
          </StyledButton>
        )}
      </ProviderActions>
    </StyledRow>
  )
}

export default createFragmentContainer(
  withAtmosphere(withMutationProps(withRouter(AtlassianProviderRow))),
  graphql`
    fragment AtlassianProviderRow_projects on AtlassianProject @relay(plural: true) {
      teamMembers {
        userId
      }
    }
  `
)
