import {convertFromRaw} from 'draft-js'
import PropTypes from 'prop-types'
import React, {Component} from 'react'
import NullCard from 'universal/components/NullCard/NullCard'
import OutcomeCardContainer from 'universal/modules/outcomeCard/containers/OutcomeCard/OutcomeCardContainer'
import {createFragmentContainer} from 'react-relay'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'

class NullableTask extends Component {
  static propTypes = {
    area: PropTypes.string,
    hasDragStyles: PropTypes.bool,
    handleAddTask: PropTypes.func,
    isAgenda: PropTypes.bool,
    isDragging: PropTypes.bool,
    isPreview: PropTypes.bool,
    // used by react-virtualized for archived cards. can remove when we remove aphrodite
    measure: PropTypes.func,
    task: PropTypes.object
  }

  state = {
    contentState: convertFromRaw(JSON.parse(this.props.task.content))
  }

  componentDidMount() {
    this._mounted = true
    if (this.props.measure) {
      setTimeout(() => {
        if (this._mounted) {
          this.props.measure()
        }
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.task.content !== this.props.task.content) {
      this.setState({
        contentState: convertFromRaw(JSON.parse(nextProps.task.content))
      })
    }
  }

  shouldComponentUpdate(nextProps) {
    return Boolean(
      !nextProps.isPreview ||
        nextProps.task.status !== this.props.task.status ||
        nextProps.task.content !== this.props.task.content
    )
  }

  componentWillUnmount() {
    this._mounted = false
  }
  render() {
    const {area, atmosphere, handleAddTask, hasDragStyles, isAgenda, task, isDragging} = this.props
    const {contentState} = this.state
    const {
      createdBy,
      assignee: {preferredName}
    } = task
    const showOutcome = contentState.hasText() || createdBy === atmosphere.viewerId
    return showOutcome ? (
      <OutcomeCardContainer
        area={area}
        contentState={contentState}
        handleAddTask={handleAddTask}
        hasDragStyles={hasDragStyles}
        isDragging={isDragging}
        isAgenda={isAgenda}
        task={task}
      />
    ) : (
      <NullCard preferredName={preferredName} />
    )
  }
}

export default createFragmentContainer(
  withAtmosphere(NullableTask),
  graphql`
    fragment NullableTask_task on Task {
      content
      createdBy
      status
      assignee {
        ... on TeamMember {
          preferredName
        }
      }
      ...OutcomeCardContainer_task
    }
  `
)
