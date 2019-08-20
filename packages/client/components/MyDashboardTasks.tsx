import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import UserColumnsContainer from '../modules/userDashboard/containers/UserColumns/UserColumnsContainer'
import UserTasksHeaderContainer from '../modules/userDashboard/containers/UserTasksHeader/UserTasksHeaderContainer'
import {MyDashboardTasks_viewer} from '../__generated__/MyDashboardTasks_viewer.graphql'

interface Props {
  viewer: MyDashboardTasks_viewer
}

const MyDashboardTasks = (props: Props) => {
  const {viewer} = props
  return (
    <>
      <UserTasksHeaderContainer viewer={viewer} />
      <UserColumnsContainer viewer={viewer} />
    </>
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
