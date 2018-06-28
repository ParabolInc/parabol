import PropTypes from 'prop-types'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import AddGitHubRepo from 'universal/modules/teamDashboard/AddGitHubRepo/AddGitHubRepo'
import GitHubRepoRow from 'universal/modules/teamDashboard/components/GitHubRepoRow'
import IntegrationsNavigateBack from 'universal/modules/teamDashboard/components/IntegrationsNavigateBack/IntegrationsNavigateBack'
import {providerLookup} from 'universal/modules/teamDashboard/components/ProviderRow/ProviderRow'
import RemoveProviderMutation from 'universal/mutations/RemoveProviderMutation'
import ui from 'universal/styles/ui'
import {GITHUB} from 'universal/utils/constants'
import SettingsWrapper from 'universal/components/Settings/SettingsWrapper'
import FlatButton from 'universal/components/FlatButton'
import RaisedButton from 'universal/components/RaisedButton'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'
import Panel from 'universal/components/Panel/Panel'
import Row from 'universal/components/Row/Row'
import RowActions from 'universal/components/Row/RowActions'
import RowInfo from 'universal/components/Row/RowInfo'
import styled from 'react-emotion'

const ProviderDetails = styled(Row)({
  border: 0,
  justifyContent: 'flex-start',
  paddingRight: 0
})

const ProviderAvatar = styled('div')({
  backgroundColor: ui.providers.github.color,
  borderRadius: ui.providerIconBorderRadius
})

const ProviderName = styled('div')({
  ...ui.providerName
})

const ProviderIcon = styled(StyledFontAwesome)({
  alignItems: 'center',
  color: ui.palette.white,
  display: 'flex !important',
  fontSize: `${ui.iconSize2x} !important`,
  height: ui.providerIconSize,
  justifyContent: 'center',
  width: ui.providerIconSize
})

const SubHeading = styled('div')({
  ...ui.rowSubheading
})

const AddGitHubButton = styled(RaisedButton)({
  margin: '0 auto',
  marginBottom: ui.rowGutter
})

const {makeUri} = providerLookup[GITHUB]

const GitHubIntegrations = (props) => {
  const {
    relay: {environment},
    jwt,
    teamId,
    viewer
  } = props
  const {githubRepos, integrationProvider} = viewer
  const accessToken = integrationProvider && integrationProvider.accessToken
  const providerUserName = integrationProvider && integrationProvider.providerUserName
  const openOauth = () => {
    const uri = makeUri(jwt, teamId)
    window.open(uri)
  }
  return (
    <SettingsWrapper>
      <IntegrationsNavigateBack teamId={teamId} />
      {/* TODO: see if we can share this with ProviderIntegrationRow even though it has a Link component */}
      <ProviderDetails>
        <ProviderAvatar>
          <ProviderIcon name='github' />
        </ProviderAvatar>
        <RowInfo>
          <ProviderName>{ui.providers.github.providerName}</ProviderName>
          <SubHeading>{ui.providers.github.description}</SubHeading>
        </RowInfo>
        {accessToken && (
          <RowActions>
            <FlatButton
              onClick={() =>
                RemoveProviderMutation(environment, integrationProvider.id, GITHUB, teamId)
              }
              palette='mid'
            >
              {'Remove GitHub'}
            </FlatButton>
            <FlatButton onClick={openOauth} palette='mid'>
              {`Refresh Token for ${providerUserName}`}
            </FlatButton>
          </RowActions>
        )}
      </ProviderDetails>
      <Panel label='Repositories'>
        {accessToken ? (
          <Row>
            <AddGitHubRepo
              accessToken={accessToken}
              environment={environment}
              teamId={teamId}
              subbedRepos={githubRepos}
            />
          </Row>
        ) : (
          <AddGitHubButton size='medium' onClick={openOauth} palette='warm'>
            {'Authorize GitHub to Add a Repo'}
          </AddGitHubButton>
        )}
        {githubRepos && (
          <RowInfo>
            {githubRepos.map((repo) => (
              <GitHubRepoRow
                accessToken={accessToken}
                key={repo.id}
                repo={repo}
                environment={environment}
                teamId={teamId}
              />
            ))}
          </RowInfo>
        )}
      </Panel>
    </SettingsWrapper>
  )
}

GitHubIntegrations.propTypes = {
  jwt: PropTypes.string.isRequired,
  relay: PropTypes.object.isRequired,
  viewer: PropTypes.object.isRequired,
  teamId: PropTypes.string.isRequired
}

export default createFragmentContainer(
  GitHubIntegrations,
  graphql`
    fragment GitHubIntegrations_viewer on User {
      integrationProvider(teamId: $teamId, service: $service) {
        id
        accessToken
        providerUserName
      }
      githubRepos(teamId: $teamId) {
        id
        adminUserId
        nameWithOwner
        teamMembers {
          id
          preferredName
          picture
        }
      }
    }
  `
)
