import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import UserTasksHeader from '../modules/userDashboard/components/UserTasksHeader/UserTasksHeader'
import UserColumnsContainer from '../modules/userDashboard/containers/UserColumns/UserColumnsContainer'
import {MyDashboardTasksAndHeaderQuery} from '../__generated__/MyDashboardTasksAndHeaderQuery.graphql'

interface Props {
  prepared: {
    queryRef: PreloadedQuery<MyDashboardTasksAndHeaderQuery>
  }
}

const MyDashboardTasksAndHeader = (props: Props) => {
  const {queryRef} = props.prepared
  const data = usePreloadedQuery<MyDashboardTasksAndHeaderQuery>(
    graphql`
      query MyDashboardTasksAndHeaderQuery($after: DateTime, $userIds: [ID!], $teamIds: [ID!]) {
        viewer {
          ...UserTasksHeader_viewer
          ...UserColumnsContainer_viewer
        }
      }
    `,
    queryRef,
    {UNSTABLE_renderPolicy: 'full'}
  )
  const {viewer} = data
  return (
    <>
      <UserTasksHeader viewerRef={viewer} />
      <UserColumnsContainer viewerRef={viewer} />
    </>
  )
}

export default MyDashboardTasksAndHeader
