import graphql from 'babel-plugin-relay/macro'
import {createFragmentContainer} from 'react-relay'
import {JiraScopingSearchResults_meeting} from '../__generated__/JiraScopingSearchResults_meeting.graphql'
import JiraScopingSearchBar from './JiraScopingSearchBar'
import React from 'react'
interface Props {
  meeting: JiraScopingSearchResults_meeting
}

const JiraScopingSearchResults = (props: Props) => {
  const {meeting} = props
  return (
    <div>RESULTS</div>
  )
}

export default createFragmentContainer(JiraScopingSearchResults, {
  meeting: graphql`
    fragment JiraScopingSearchResults_meeting on PokerMeeting {
      id
    }
  `
})
