import {GitHubIntegrations_viewer} from '__generated__/GitHubIntegrations_viewer.graphql'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import FlatButton from 'universal/components/FlatButton'
import Panel from 'universal/components/Panel/Panel'
import RaisedButton from 'universal/components/RaisedButton'
import Row from 'universal/components/Row/Row'
import RowActions from 'universal/components/Row/RowActions'
import RowInfo from 'universal/components/Row/RowInfo'
import SettingsWrapper from 'universal/components/Settings/SettingsWrapper'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import AddGitHubRepo from 'universal/modules/teamDashboard/AddGitHubRepo/AddGitHubRepo'
import GitHubRepoRow from 'universal/modules/teamDashboard/components/GitHubRepoRow'
import IntegrationsNavigateBack from 'universal/modules/teamDashboard/components/IntegrationsNavigateBack/IntegrationsNavigateBack'
import RemoveProviderMutation from 'universal/mutations/RemoveProviderMutation'
import ui from 'universal/styles/ui'
import {GITHUB} from 'universal/utils/constants'
import handleOpenOAuth from 'universal/utils/handleOpenOAuth'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'

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

interface Props extends WithAtmosphereProps, WithMutationProps {
  teamId: string
  viewer: GitHubIntegrations_viewer
}

const GitHubIntegrations = (props: Props) => {
  const {teamId, viewer, submitting, submitMutation, atmosphere, onError, onCompleted} = props
  const {githubRepos, integrationProvider} = viewer
  const accessToken = integrationProvider && integrationProvider.accessToken
  const providerUserName = integrationProvider && integrationProvider.providerUserName
  const openOAuth = handleOpenOAuth({
    name: GITHUB,
    submitting,
    submitMutation,
    atmosphere,
    onError,
    onCompleted,
    teamId
  })
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
                RemoveProviderMutation(
                  atmosphere,
                  {
                    providerId: integrationProvider && integrationProvider.id,
                    teamId
                  },
                  {service: GITHUB, onError, onCompleted}
                )
              }
              palette='mid'
            >
              {'Remove GitHub'}
            </FlatButton>
            <FlatButton onClick={openOAuth} palette='mid'>
              {`Refresh Token for ${providerUserName}`}
            </FlatButton>
          </RowActions>
        )}
      </ProviderDetails>
      <Panel label='Repositories'>
        {accessToken ? (
          <Row>
            <AddGitHubRepo accessToken={accessToken} teamId={teamId} subbedRepos={githubRepos} />
          </Row>
        ) : (
          <AddGitHubButton size='medium' onClick={openOAuth} palette='warm'>
            {'Authorize GitHub to Add a Repo'}
          </AddGitHubButton>
        )}
        {githubRepos && (
          <RowInfo>
            {githubRepos.map((repo) => (
              <GitHubRepoRow accessToken={accessToken} key={repo.id} repo={repo} teamId={teamId} />
            ))}
          </RowInfo>
        )}
      </Panel>
    </SettingsWrapper>
  )
}

export default createFragmentContainer(
  withAtmosphere(withMutationProps(GitHubIntegrations)),
  graphql`
    fragment GitHubIntegrations_viewer on User {
      integrationProvider(teamId: $teamId, service: $service) {
        id
        accessToken
        providerUserName
      }
      githubRepos(teamId: $teamId) {
        id
        ...AddGitHubRepo_subbedRepos
        ...GitHubRepoRow_repo
      }
    }
  `
)
