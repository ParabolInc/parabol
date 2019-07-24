import {DashAlert_viewer} from '../__generated__/DashAlert_viewer.graphql'
import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import DashAlertMeeting from './DashAlertMeeting'
import DashAlertOverLimit from './DashAlertOverLimit'

interface Props {
  viewer: DashAlert_viewer | null
}

const DashAlert = (props: Props) => {
  const {viewer} = props
  if (!viewer) return null
  if (viewer.overLimitCopy) return <DashAlertOverLimit viewer={viewer} />
  return <DashAlertMeeting viewer={viewer} />
}

export default createFragmentContainer(DashAlert, {
  viewer: graphql`
    fragment DashAlert_viewer on User {
      overLimitCopy
      ...DashAlertOverLimit_viewer
      ...DashAlertMeeting_viewer
    }
  `
})
