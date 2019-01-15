import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import {MyDashboardTimeline_viewer} from '__generated__/MyDashboardTimeline_viewer.graphql'

interface Props {
  viewer: MyDashboardTimeline_viewer
}

const MyDashboardTimeline = (props: Props) => {
  const {viewer} = props
  return <div>The timeline for {viewer.id}</div>
}

export default createFragmentContainer(
  MyDashboardTimeline,
  graphql`
    fragment MyDashboardTimeline_viewer on User {
      id
    }
  `
)
