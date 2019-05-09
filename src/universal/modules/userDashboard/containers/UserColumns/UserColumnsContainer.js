import PropTypes from 'prop-types'
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {createFragmentContainer} from 'react-relay'
import TaskColumns from 'universal/components/TaskColumns/TaskColumns'
import {USER_DASH} from 'universal/utils/constants'
import getTaskById from 'universal/utils/getTaskById'

const mapStateToProps = (state) => {
  return {
    teamFilterId: state.userDashboard.teamFilterId
  }
}

class UserColumnsContainer extends Component {
  componentWillMount () {
    this.filterTasks(this.props)
  }

  componentWillReceiveProps (nextProps) {
    const {
      teamFilterId: oldFilter,
      viewer: {contentFilter: oldContentFilter, tasks: oldTasks}
    } = this.props
    const {
      teamFilterId,
      viewer: {contentFilter, tasks}
    } = nextProps
    if (oldFilter !== teamFilterId || oldTasks !== tasks || oldContentFilter !== contentFilter) {
      this.filterTasks(nextProps)
    }
  }

  filterTasks (props) {
    const {
      teamFilterId,
      viewer: {contentFilter, tasks}
    } = props
    const contentFilterRegex = new RegExp(contentFilter, 'i')
    const contentFilteredEdges = contentFilter
      ? tasks.edges.filter(({node}) => {
        const {contentText} = node
        return contentText && node.contentText.match(contentFilterRegex)
      })
      : tasks.edges
    const teamFilteredEdges = teamFilterId
      ? contentFilteredEdges.filter(({node}) => node.team.id === teamFilterId)
      : contentFilteredEdges
    const edgesWithTeams = teamFilteredEdges.map((edge) => {
      return {
        ...edge,
        node: {
          ...edge.node
        }
      }
    })
    this.setState({
      tasks: {
        ...tasks,
        edges: edgesWithTeams
      }
    })
  }

  render () {
    const {
      userId,
      viewer: {teams, tasks: allTasks}
    } = this.props
    const {tasks} = this.state
    return (
      <TaskColumns
        area={USER_DASH}
        getTaskById={getTaskById(allTasks)}
        tasks={tasks}
        teams={teams}
        userId={userId}
      />
    )
  }
}

UserColumnsContainer.propTypes = {
  tasks: PropTypes.object,
  teamFilterId: PropTypes.string,
  userId: PropTypes.string,
  viewer: PropTypes.object
}

export default createFragmentContainer(
  connect(mapStateToProps)(UserColumnsContainer),
  graphql`
    fragment UserColumnsContainer_viewer on User {
      teams {
        id
        name
        meetingId
      }
      contentFilter
      tasks(first: 1000) @connection(key: "UserColumnsContainer_tasks") {
        ...TaskColumns_tasks
        edges {
          node {
            # grab these so we can sort correctly
            id
            content @__clientField(handle: "contentText")
            contentText
            status
            sortOrder
            team {
              id
            }
          }
        }
      }
    }
  `
)
