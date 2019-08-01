import PropTypes from 'prop-types'
import React from 'react'
import {connect} from 'react-redux'
import UserTasksHeader from '../../components/UserTasksHeader/UserTasksHeader'
import graphql from 'babel-plugin-relay/macro'
import {createFragmentContainer} from 'react-relay'

const mapStateToProps = (state) => {
  return {
    teamFilterId: state.userDashboard.teamFilterId,
    teamFilterName: state.userDashboard.teamFilterName
  }
}

const UserTasksHeaderContainer = (props) => {
  const {
    dispatch,
    teamFilterId,
    teamFilterName,
    viewer: {teams}
  } = props
  const teamsArray = teams || []
  return (
    <UserTasksHeader
      dispatch={dispatch}
      teams={teamsArray}
      teamFilterId={teamFilterId}
      teamFilterName={teamFilterName}
    />
  )
}

UserTasksHeaderContainer.propTypes = {
  dispatch: PropTypes.func,
  teamFilterId: PropTypes.string,
  teamFilterName: PropTypes.string
}

export default createFragmentContainer(connect(mapStateToProps)(UserTasksHeaderContainer), {
  viewer: graphql`
    fragment UserTasksHeaderContainer_viewer on User {
      teams {
        id
        name
        meetingId
      }
    }
  `
})
