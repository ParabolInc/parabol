import PropTypes from 'prop-types'
import React, {Component} from 'react'
import IntegrationRow from 'universal/modules/teamDashboard/components/IntegrationRow/IntegrationRow'
import JoinIntegrationMutation from 'universal/mutations/JoinIntegrationMutation'
import LeaveIntegrationMutation from 'universal/mutations/LeaveIntegrationMutation'
import formError from 'universal/styles/helpers/formError'
import ui from 'universal/styles/ui'
import appTheme from 'universal/styles/theme/appTheme'
import withMutationProps from 'universal/utils/relay/withMutationProps'
import FlatButton from 'universal/components/FlatButton'
import Avatar from 'universal/components/Avatar/Avatar'
import Tag from 'universal/components/Tag/Tag'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'
import styled from 'react-emotion'

const StyledButton = styled(FlatButton)({
  marginLeft: ui.rowGutter,
  minWidth: '7rem'
})

const AvatarGroup = styled('div')({
  marginLeft: 'auto',
  paddingLeft: ui.rowGutter,
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
  flex: 1,
  fontSize: appTheme.typography.s3,
  fontWeight: 600
})

const StyledIcon = styled(StyledFontAwesome)({
  marginLeft: '.5rem'
})

const getViewerInIntegration = (props) => {
  const {
    environment: {userId},
    teamId,
    repo: {teamMembers}
  } = props
  const teamMemberId = `${userId}::${teamId}`
  return Boolean(teamMembers.find((teamMember) => teamMember.id === teamMemberId))
}

class GitHubRepoRow extends Component {
  constructor (props) {
    super(props)
    this.state = {
      viewerInIntegration: getViewerInIntegration(props)
    }
  }

  componentWillReceiveProps (nextProps) {
    const {repo} = nextProps
    if (this.props.repo !== repo) {
      const viewerInIntegration = getViewerInIntegration(nextProps)
      if (viewerInIntegration !== this.state.viewerInIntegration) {
        this.setState({
          viewerInIntegration
        })
      }
    }
  }

  toggleIntegrationMembership = (githubGlobalId) => () => {
    const {environment, submitMutation, onError, onCompleted, teamId} = this.props
    submitMutation()
    if (this.viewerInIntegration) {
      LeaveIntegrationMutation(environment, githubGlobalId, teamId, onError, onCompleted)
    } else {
      JoinIntegrationMutation(environment, githubGlobalId, teamId, onError, onCompleted)
    }
  }

  render () {
    const {accessToken, environment, error, submitting, repo} = this.props
    const {id, adminUserId, nameWithOwner, teamMembers} = repo
    const {userId} = environment
    const isCreator = adminUserId === userId
    return (
      <RowContainer>
        <IntegrationRow>
          <RepoInfo>
            <NameWithOwner
              href={`https://github.com/${nameWithOwner}`}
              rel='noopener noreferrer'
              target='_blank'
              title={nameWithOwner}
            >
              {nameWithOwner}
              <StyledIcon name={ui.iconExternalLink} />
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
          {accessToken &&
            !isCreator && (
              <StyledButton onClick={this.toggleIntegrationMembership(id)} waiting={submitting}>
                {this.viewerInIntegration ? 'Unlink Me' : 'Link Me'}
              </StyledButton>
            )}
        </IntegrationRow>
        {error && <ErrorRow>{error.message}</ErrorRow>}
      </RowContainer>
    )
  }
}

GitHubRepoRow.propTypes = {
  error: PropTypes.object,
  submitting: PropTypes.bool,
  submitMutation: PropTypes.func.isRequired,
  onCompleted: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  accessToken: PropTypes.string,
  environment: PropTypes.object,
  teamId: PropTypes.string,
  repo: PropTypes.object
}

export default withMutationProps(GitHubRepoRow)
