import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import UserColumnsContainer from '../modules/userDashboard/containers/UserColumns/UserColumnsContainer'
import UserTasksHeaderContainer from '../modules/userDashboard/containers/UserTasksHeader/UserTasksHeaderContainer'
import {MyDashboardTasks_viewer} from '../__generated__/MyDashboardTasks_viewer.graphql'

interface Props {
  viewer: MyDashboardTasks_viewer
}

const MyDashboardTasks = (props: Props) => {
  const {viewer} = props
  return (
    <React.Fragment>
      <UserTasksHeaderContainer viewer={viewer} />
      <UserColumnsContainer viewer={viewer} />
    </React.Fragment>
  )
}

export default createFragmentContainer(MyDashboardTasks, {
  viewer: graphql`
    fragment MyDashboardTasks_viewer on User {
      ...UserColumnsContainer_viewer
      ...UserTasksHeaderContainer_viewer
    }
  `
})
