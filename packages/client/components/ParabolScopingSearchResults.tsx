import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {ParabolScopingSearchResults_meeting} from '../__generated__/ParabolScopingSearchResults_meeting.graphql'

interface Props {
  meeting: ParabolScopingSearchResults_meeting
}

const ParabolScopingSearchResults = (props: Props) => {
  const {meeting} = props
  return <div> These are my search results{meeting.id}</div>
}

export default createFragmentContainer(ParabolScopingSearchResults, {
  meeting: graphql`
    fragment ParabolScopingSearchResults_meeting on PokerMeeting {
      id
    }
  `
})
