import {AtlassianProviderRow_projects} from '__generated__/AtlassianProviderRow_projects.graphql'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import {Link, RouteComponentProps, withRouter} from 'react-router-dom'
import RaisedButton from 'universal/components/RaisedButton'
import Row from 'universal/components/Row/Row'
import RowActions from 'universal/components/Row/RowActions'
import RowInfo from 'universal/components/Row/RowInfo'
import RowInfoCopy from 'universal/components/Row/RowInfoCopy'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import ui from 'universal/styles/ui'
import handleOpenOAuth from 'universal/utils/handleOpenOAuth'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import AtlassianProviderLogo from '../../../../AtlassianProviderLogo'
import ProviderRowName from './ProviderRowName'

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

const ProviderActions = styled(RowActions)({
  marginLeft: 'auto',
  paddingLeft: ui.rowGutter,
  maxWidth: '10rem'
})

const StyledLink = styled(Link)({
  display: 'block',
  textDecoration: 'none'
})

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
  const to = `/team/${teamId}/settings/integrations/atlassian`
  const users = new Set()
  projects.forEach((project) =>
    project.teamMembers.forEach((teamMember) => users.add(teamMember.userId))
  )
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
          <ProviderRowName
            name='Atlassian'
            userCount={users.size}
            integrationCount={projects.length}
          />
          <RowInfoCopy>{'Create Jira issues from Parabol'}</RowInfoCopy>
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
