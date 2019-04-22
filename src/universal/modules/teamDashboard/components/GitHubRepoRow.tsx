import memoize from 'micro-memoize'
import React, {Component} from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import Avatar from 'universal/components/Avatar/Avatar'
import FlatButton from 'universal/components/FlatButton'
import Tag from 'universal/components/Tag/Tag'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import IntegrationRow from 'universal/modules/teamDashboard/components/IntegrationRow/IntegrationRow'
import JoinIntegrationMutation from 'universal/mutations/JoinIntegrationMutation'
import LeaveIntegrationMutation from 'universal/mutations/LeaveIntegrationMutation'
import RemoveGitHubRepoMutation from 'universal/mutations/RemoveGitHubRepoMutation'
import formError from 'universal/styles/helpers/formError'
import fromGlobalId from 'universal/utils/relay/fromGlobalId'
import toTeamMemberId from 'universal/utils/relay/toTeamMemberId'
import withMutationProps, {WithMutationProps} from 'universal/utils/relay/withMutationProps'
import {GitHubRepoRow_repo} from '__generated__/GitHubRepoRow_repo.graphql'
import {PALETTE} from 'universal/styles/paletteV2'
import {ROW_GUTTER} from 'universal/styles/rows'

const StyledButton = styled(FlatButton)({
  marginLeft: ROW_GUTTER,
  minWidth: '7rem'
})

const AvatarGroup = styled('div')({
  marginLeft: 'auto',
  paddingLeft: ROW_GUTTER,
  flex: 1,
  display: 'flex',
  justifyContent: 'flex-end'
})

const AvatarBlock = styled('div')({
  margin: '0 0 0 .5rem'
})

const ErrorRow = styled('div')({
  ...formError,
  marginTop: '-1rem',
  padding: '0 1rem',
  textAlign: 'end'
})

const RepoInfo = styled('div')({
  alignItems: 'center',
  display: 'flex'
})

const RowContainer = styled('div')({
  display: 'flex',
  flex: 1,
  flexDirection: 'column'
})

const NameWithOwner = styled('a')({
  display: 'block',
  color: PALETTE.LINK.BLUE,
  flex: 1,
  fontSize: 14,
  ':hover,:focus,:active': {
    color: PALETTE.LINK.BLUE,
    textDecoration: 'underline'
  }
})

interface Props extends WithAtmosphereProps, WithMutationProps {
  accessToken: string | null
  repo: GitHubRepoRow_repo
  teamId: string
}

class GitHubRepoRow extends Component<Props> {
  getViewerInIntegration = memoize((teamMembers, teamMemberId) => {
    return Boolean(teamMembers.find((teamMember) => teamMember.id === teamMemberId))
  })

  removeRepo = () => {
    const {atmosphere, submitting, submitMutation, onError, onCompleted, repo, teamId} = this.props
    if (submitting) return
    submitMutation()
    const githubIntegrationId = fromGlobalId(repo.id).id
    const handleCompleted = () => {
      onCompleted()
      atmosphere.eventEmitter.emit('removeGitHubRepo')
    }
    RemoveGitHubRepoMutation(atmosphere, {githubIntegrationId}, {teamId}, onError, handleCompleted)
  }

  toggleIntegrationMembership = (githubGlobalId) => () => {
    const {atmosphere, submitting, submitMutation, onError, onCompleted, repo, teamId} = this.props
    if (submitting) return
    const {teamMembers} = repo
    const {viewerId} = atmosphere
    submitMutation()
    const viewerInIntegration = this.getViewerInIntegration(
      teamMembers,
      toTeamMemberId(teamId, viewerId)
    )
    if (viewerInIntegration) {
      LeaveIntegrationMutation(atmosphere, githubGlobalId, teamId, onError, onCompleted)
    } else {
      JoinIntegrationMutation(atmosphere, githubGlobalId, teamId, onError, onCompleted)
    }
  }

  render () {
    const {accessToken, atmosphere, error, submitting, repo, teamId} = this.props
    const {id, adminUserId, nameWithOwner, teamMembers} = repo
    const {viewerId} = atmosphere
    const isCreator = adminUserId === viewerId
    const viewerInIntegration = this.getViewerInIntegration(
      teamMembers,
      toTeamMemberId(teamId, viewerId)
    )
    return (
      <RowContainer>
        <IntegrationRow>
          <RepoInfo>
            <NameWithOwner
              href={`https://github.com/${nameWithOwner}`}
              rel='noopener noreferrer'
              target='_blank'
              title={nameWithOwner || ''}
            >
              {nameWithOwner}
              {isCreator && <Tag colorPalette='light' label='Creator' />}
            </NameWithOwner>
          </RepoInfo>
          <AvatarGroup>
            {teamMembers.map((user) => (
              <AvatarBlock key={user.id}>
                <Avatar {...user} size='smallest' />
              </AvatarBlock>
            ))}
          </AvatarGroup>
          {accessToken && !isCreator && (
            <StyledButton onClick={this.toggleIntegrationMembership(id)} waiting={submitting}>
              {viewerInIntegration ? 'Unlink Me' : 'Link Me'}
            </StyledButton>
          )}
          {accessToken && isCreator && (
            <StyledButton onClick={this.removeRepo} waiting={submitting}>
              {'Remove Repo'}
            </StyledButton>
          )}
        </IntegrationRow>
        {error && <ErrorRow>{error}</ErrorRow>}
      </RowContainer>
    )
  }
}

export default createFragmentContainer(
  withAtmosphere(withMutationProps(GitHubRepoRow)),
  graphql`
    fragment GitHubRepoRow_repo on GitHubIntegration {
      id
      adminUserId
      nameWithOwner
      teamMembers {
        id
        preferredName
        picture
      }
    }
  `
)
