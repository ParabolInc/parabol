import PropTypes from 'prop-types'
import React, {Component} from 'react'
import {createFragmentContainer} from 'react-relay'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import OutcomeCardMessage from 'universal/modules/outcomeCard/components/OutcomeCardMessage/OutcomeCardMessage'
import UpdateTaskMutation from 'universal/mutations/UpdateTaskMutation'
import textOverflow from 'universal/styles/helpers/textOverflow'
import appTheme from 'universal/styles/theme/theme'
import ui, {
  DEFAULT_MENU_HEIGHT,
  DEFAULT_MENU_WIDTH,
  HUMAN_ADDICTION_THRESH,
  MAX_WAIT_TIME
} from 'universal/styles/ui'
import {USER_DASH} from 'universal/utils/constants'
import removeAllRangesForEntity from 'universal/utils/draftjs/removeAllRangesForEntity'
import isTaskArchived from 'universal/utils/isTaskArchived'
import {clearError, setError} from 'universal/utils/relay/mutationCallbacks'
import OutcomeCardFooterButton from '../OutcomeCardFooterButton/OutcomeCardFooterButton'
import avatarUser from 'universal/styles/theme/images/avatar-user.svg'
import Loadable from 'react-loadable'
import LoadableMenu from 'universal/components/LoadableMenu'
import LoadableLoading from 'universal/components/LoadableLoading'
import BaseButton from 'universal/components/BaseButton'
import styled, {css} from 'react-emotion'

const height = ui.cardButtonHeight

const label = {
  ...textOverflow,
  color: ui.colorText,
  display: 'block',
  flex: 1,
  fontSize: appTheme.typography.s1,
  fontWeight: 400,
  lineHeight: height,
  maxWidth: '100%',
  textAlign: 'left'
}

const Footer = styled('div')({
  display: 'flex',
  height: '3.375rem',
  justifyContent: 'space-between',
  maxWidth: '100%',
  padding: ui.cardPaddingBase
})

const teamToggleButtonStyles = css({
  ...label,
  color: ui.colorText,
  fontSize: appTheme.typography.s1,
  outline: 0,
  textAlign: 'left'
})

const avatarButtonStyles = css({
  border: 0,
  boxShadow: 'none',
  display: 'flex',
  fontSize: 'inherit',
  height,
  lineHeight: 'inherit',
  outline: 0,
  padding: 0,
  maxWidth: '100%',
  ':hover,:focus,:active': {
    boxShadow: 'none'
  },
  ':hover > div,:focus > div': {
    borderColor: appTheme.palette.dark,
    color: appTheme.palette.dark10d
  }
})

const AvatarBlock = styled('div')({
  flex: 1,
  height,
  minWidth: 0
})

const Avatar = styled('div')(({cardIsActive}) => ({
  backgroundColor: 'transparent',
  border: '.0625rem solid transparent',
  borderColor: cardIsActive && appTheme.palette.mid50l,
  borderRadius: '100%',
  height: '1.75rem',
  marginLeft: '-.125rem',
  marginRight: '.25rem',
  padding: '.0625rem',
  position: 'relative',
  top: '-.125rem',
  width: '1.75rem'
}))

const AvatarImage = styled('img')({
  borderRadius: '100%',
  height,
  marginRight: '.25rem',
  width: height
})

const AvatarLabel = styled('div')({
  ...label,
  flex: 1,
  minWidth: 0
})

const ButtonGroup = styled('div')(({cardIsActive}) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  opacity: cardIsActive ? 1 : 0
}))

// ButtonSpacer helps truncated names (…) be consistent
const ButtonSpacer = styled('div')({
  display: 'inline-block',
  height,
  verticalAlign: 'middle',
  width: height
})

const LoadableAssignMenu = Loadable({
  loader: () =>
    import(/* webpackChunkName: 'OutcomeCardAssignMenuRoot' */
      'universal/modules/outcomeCard/components/OutcomeCardAssignMenuRoot'),
  loading: (props) => (
    <LoadableLoading {...props} height={DEFAULT_MENU_HEIGHT} width={DEFAULT_MENU_WIDTH} />
  ),
  delay: HUMAN_ADDICTION_THRESH,
  timeout: MAX_WAIT_TIME
})

const LoadableAssignTeamMenu = Loadable({
  loader: () =>
    import(/* webpackChunkName: 'OutcomeCardAssignMenuRoot' */
      'universal/modules/outcomeCard/components/OutcomeCardAssignTeamMenuRoot'),
  loading: (props) => (
    <LoadableLoading {...props} height={DEFAULT_MENU_HEIGHT} width={DEFAULT_MENU_WIDTH} />
  ),
  delay: HUMAN_ADDICTION_THRESH,
  timeout: MAX_WAIT_TIME
})

const LoadableStatusMenu = Loadable({
  loader: () =>
    import(/* webpackChunkName: 'OutcomeCardStatusMenu' */
      'universal/modules/outcomeCard/components/OutcomeCardStatusMenu/OutcomeCardStatusMenu'),
  loading: (props) => (
    <LoadableLoading {...props} height={DEFAULT_MENU_HEIGHT} width={DEFAULT_MENU_WIDTH} />
  ),
  delay: HUMAN_ADDICTION_THRESH,
  timeout: MAX_WAIT_TIME
})

const LoadableGitHubMenu = Loadable({
  loader: () =>
    import(/* webpackChunkName: 'GitHubReposMenuRoot' */
      'universal/containers/GitHubReposMenuRoot/GitHubReposMenuRoot'),
  loading: (props) => (
    <LoadableLoading {...props} height={DEFAULT_MENU_HEIGHT} width={DEFAULT_MENU_WIDTH} />
  ),
  delay: HUMAN_ADDICTION_THRESH,
  timeout: MAX_WAIT_TIME
})

const originAnchor = {
  vertical: 'bottom',
  horizontal: 'right'
}

const targetAnchor = {
  vertical: 'top',
  horizontal: 'right'
}

const assignOriginAnchor = {
  vertical: 'bottom',
  horizontal: 'left'
}

const assignTargetAnchor = {
  vertical: 'top',
  horizontal: 'left'
}

class OutcomeCardFooter extends Component {
  constructor (props) {
    super(props)
    this.setError = setError.bind(this)
    this.clearError = clearError.bind(this)
  }

  state = {}

  removeContentTag = (tagValue) => () => {
    const {
      area,
      atmosphere,
      task: {taskId, content}
    } = this.props
    const eqFn = (data) => data.value === tagValue
    const nextContent = removeAllRangesForEntity(content, 'TAG', eqFn)
    if (!nextContent) return
    const updatedTask = {
      id: taskId,
      content: nextContent
    }
    UpdateTaskMutation(atmosphere, updatedTask, area)
  }

  render () {
    const {
      area,
      cardIsActive,
      editorState,
      handleAddTask,
      isAgenda,
      isPrivate,
      task,
      toggleMenuState
    } = this.props
    const showTeam = area === USER_DASH
    const {taskId, assignee, integration, tags, team} = task
    const {teamId, teamName} = team
    const {service} = integration || {}
    const isArchived = isTaskArchived(tags)
    const {error} = this.state
    const ownerAvatarOrTeamName = showTeam ? (
      <BaseButton
        aria-label='Assign this task to another team'
        className={teamToggleButtonStyles}
        onClick={this.selectAllQuestion}
      >
        {teamName}
      </BaseButton>
    ) : (
      <BaseButton className={avatarButtonStyles} aria-label='Assign this task to a teammate'>
        <Avatar cardIsActive={cardIsActive}>
          <AvatarImage
            alt={assignee.preferredName}
            src={assignee.picture || avatarUser}
            // hack because aphrodite loads styles on next tick, which causes the cell height adjuster to bork >:-(
            style={{height, width: height}}
          />
        </Avatar>
        <AvatarLabel>{assignee.preferredName}</AvatarLabel>
      </BaseButton>
    )

    const canAssign = !service && !isArchived
    return (
      <React.Fragment>
        <Footer>
          <AvatarBlock>
            {!canAssign && ownerAvatarOrTeamName}
            {canAssign &&
              showTeam && (
                <LoadableMenu
                  LoadableComponent={LoadableAssignTeamMenu}
                  maxWidth={350}
                  maxHeight={225}
                  originAnchor={assignOriginAnchor}
                  queryVars={{
                    area,
                    task
                  }}
                  targetAnchor={assignTargetAnchor}
                  toggle={ownerAvatarOrTeamName}
                  onOpen={toggleMenuState}
                  onClose={toggleMenuState}
                />
              )}
            {canAssign &&
              !showTeam && (
                <LoadableMenu
                  LoadableComponent={LoadableAssignMenu}
                  isToggleNativeElement
                  maxWidth={350}
                  maxHeight={225}
                  originAnchor={assignOriginAnchor}
                  queryVars={{
                    area,
                    task,
                    teamId
                  }}
                  targetAnchor={assignTargetAnchor}
                  toggle={ownerAvatarOrTeamName}
                  onOpen={toggleMenuState}
                  onClose={toggleMenuState}
                />
              )}
          </AvatarBlock>
          <ButtonGroup cardIsActive={cardIsActive}>
            {isArchived ? (
              <OutcomeCardFooterButton onClick={this.removeContentTag('archived')} icon='reply' />
            ) : (
              <React.Fragment>
                {/* ButtonSpacer helps truncated names (…) be consistent */}
                {!service ? (
                  <LoadableMenu
                    LoadableComponent={LoadableGitHubMenu}
                    maxWidth={350}
                    maxHeight={225}
                    originAnchor={originAnchor}
                    queryVars={{
                      area,
                      handleAddTask,
                      taskId,
                      teamId,
                      setError: this.setError,
                      clearError: this.clearError
                    }}
                    targetAnchor={targetAnchor}
                    toggle={<OutcomeCardFooterButton icon='github' />}
                    onOpen={toggleMenuState}
                    onClose={toggleMenuState}
                  />
                ) : (
                  <ButtonSpacer />
                )}
                <LoadableMenu
                  LoadableComponent={LoadableStatusMenu}
                  maxWidth={350}
                  maxHeight={225}
                  originAnchor={originAnchor}
                  queryVars={{
                    area,
                    editorState,
                    isAgenda,
                    isPrivate,
                    task,
                    removeContentTag: this.removeContentTag
                  }}
                  targetAnchor={targetAnchor}
                  toggle={<OutcomeCardFooterButton icon='ellipsis-v' />}
                  onOpen={toggleMenuState}
                  onClose={toggleMenuState}
                />
              </React.Fragment>
            )}
          </ButtonGroup>
        </Footer>
        {error && <OutcomeCardMessage onClose={this.clearError} message={error} />}
      </React.Fragment>
    )
  }
}

OutcomeCardFooter.propTypes = {
  area: PropTypes.string.isRequired,
  atmosphere: PropTypes.object.isRequired,
  cardIsActive: PropTypes.bool,
  editorState: PropTypes.object,
  handleAddTask: PropTypes.func,
  isAgenda: PropTypes.bool,
  isArchived: PropTypes.bool,
  isPrivate: PropTypes.bool,
  task: PropTypes.object,
  showTeam: PropTypes.bool,
  toggleMenuState: PropTypes.func.isRequired
}

export default createFragmentContainer(
  withAtmosphere(OutcomeCardFooter),
  graphql`
    fragment OutcomeCardFooter_task on Task {
      taskId: id
      content
      assignee {
        ... on TeamMember {
          picture
        }
        preferredName
      }
      integration {
        service
      }
      tags
      team {
        teamId: id
        teamName: name
      }
      ...OutcomeCardAssignTeamMenu_task
      ...OutcomeCardAssignMenu_task
      ...OutcomeCardStatusMenu_task
    }
  `
)
