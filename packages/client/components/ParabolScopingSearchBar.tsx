import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {ParabolScopingSearchBar_meeting} from '../__generated__/ParabolScopingSearchBar_meeting.graphql'

interface Props {
  meeting: ParabolScopingSearchBar_meeting
}

const ParabolScopingSearchBar = (props: Props) => {
  const {meeting} = props
  return <div>Hello this is my search bar {meeting.id}</div>
}

export default createFragmentContainer(ParabolScopingSearchBar, {
  meeting: graphql`
    fragment ParabolScopingSearchBar_meeting on PokerMeeting {
      id
    }
  `
})
