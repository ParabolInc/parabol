import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {NewMeetingExistingMeetings_viewer} from '~/__generated__/NewMeetingExistingMeetings_viewer.graphql'

interface Props {
  viewer: NewMeetingExistingMeetings_viewer
}

const NewMeetingExistingMeetings = (props: Props) => {
  const {viewer} = props
  const {id} = viewer
  return <div>`Existing meetings ${id}`</div>
}

export default createFragmentContainer(NewMeetingExistingMeetings, {
  viewer: graphql`
    fragment NewMeetingExistingMeetings_viewer on User {
      id
      teams {
        activeMeetings {
          id
        }
      }
    }
  `
})
