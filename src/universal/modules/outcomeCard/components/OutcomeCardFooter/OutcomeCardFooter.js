import PropTypes from 'prop-types'
import React, {Component} from 'react'
import {createFragmentContainer} from 'react-relay'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import OutcomeCardMessage from 'universal/modules/outcomeCard/components/OutcomeCardMessage/OutcomeCardMessage'
import UpdateTaskMutation from 'universal/mutations/UpdateTaskMutation'
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
import Loadable from 'react-loadable'
import LoadableMenu from 'universal/components/LoadableMenu'
import LoadableLoading from 'universal/components/LoadableLoading'
import CardButton from 'universal/components/CardButton'
import IconLabel from 'universal/components/IconLabel'
import StyledFontAwesome from 'universal/components/StyledFontAwesome'
import {ICON_SIZE_FA_1X} from 'universal/styles/icons'
import styled from 'react-emotion'
import TaskFooterTeamAssignee from 'universal/modules/outcomeCard/components/OutcomeCardFooter/TaskFooterTeamAssignee'
import TaskFooterUserAssignee from 'universal/modules/outcomeCard/components/OutcomeCardFooter/TaskFooterUserAssignee'

const height = ui.cardButtonHeight

const Footer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  maxWidth: '100%',
  padding: `.75rem ${ui.cardPaddingBase} ${ui.cardPaddingBase}`
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

const StyledIcon = styled(StyledFontAwesome)({
  color: 'inherit',
  display: 'block',
  fontSize: ICON_SIZE_FA_1X,
  height: ICON_SIZE_FA_1X,
  lineHeight: ICON_SIZE_FA_1X,
  width: ICON_SIZE_FA_1X
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

const AvatarBlock = styled('div')({
  flex: 1,
  height: 24,
  minWidth: 0
})

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
    const {taskId, integration, tags, team} = task
    const {teamId} = team
    const {service} = integration || {}
    const isArchived = isTaskArchived(tags)
    const {error} = this.state
    const canAssign = !integration && !isArchived
    return (
      <React.Fragment>
        <Footer>
          <AvatarBlock>
            {showTeam ? (
              <TaskFooterTeamAssignee canAssign={canAssign} task={task} />
            ) : (
              <TaskFooterUserAssignee
                area={area}
                canAssign={canAssign}
                cardIsActive={cardIsActive}
                task={task}
              />
            )}
          </AvatarBlock>
          <ButtonGroup cardIsActive={cardIsActive}>
            {isArchived ? (
              <CardButton onClick={this.removeContentTag('archived')}>
                <IconLabel icon='reply' />
              </CardButton>
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
                    toggle={
                      <CardButton>
                        <StyledIcon name='github' />
                      </CardButton>
                    }
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
                  toggle={
                    <CardButton>
                      <IconLabel icon='more_vert' />
                    </CardButton>
                  }
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
      integration {
        service
      }
      tags
      team {
        teamId: id
      }
      ...TaskFooterTeamAssignee_task
      ...TaskFooterUserAssignee_task
      ...OutcomeCardStatusMenu_task
    }
  `
)
