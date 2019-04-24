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
import RowInfoHeading from 'universal/components/Row/RowInfoHeading'
import RowInfoCopy from 'universal/components/Row/RowInfoCopy'
import SettingsWrapper from 'universal/components/Settings/SettingsWrapper'
import GitHubProviderLogo from 'universal/GitHubProviderLogo'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import AddGitHubRepo from 'universal/modules/teamDashboard/AddGitHubRepo/AddGitHubRepo'
import GitHubRepoRow from 'universal/modules/teamDashboard/components/GitHubRepoRow'
import IntegrationsNavigateBack from 'universal/modules/teamDashboard/components/IntegrationsNavigateBack/IntegrationsNavigateBack'
import RemoveProviderMutation from 'universal/mutations/RemoveProviderMutation'
import {GITHUB} from 'universal/utils/constants'
import handleOpenOAuth from 'universal/utils/handleOpenOAuth'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import {Layout, Providers} from 'universal/types/constEnums'

const ProviderDetails = styled(Row)({
  border: 0,
  justifyContent: 'flex-start'
})

const AddGitHubButton = styled(RaisedButton)({
  margin: '0 auto',
  marginBottom: Layout.ROW_GUTTER
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
      <Panel>
        <ProviderDetails>
          <GitHubProviderLogo />
          <RowInfo>
            <RowInfoHeading>{Providers.GITHUB_NAME}</RowInfoHeading>
            <RowInfoCopy>{Providers.GITHUB_DESC}</RowInfoCopy>
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
              >
                {'Remove GitHub'}
              </FlatButton>
              <FlatButton onClick={openOAuth}>{`Refresh Token for ${providerUserName}`}</FlatButton>
            </RowActions>
          )}
        </ProviderDetails>
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
