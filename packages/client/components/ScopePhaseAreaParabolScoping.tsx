import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {ScopePhaseAreaParabolScoping_meeting} from '../__generated__/ScopePhaseAreaParabolScoping_meeting.graphql'
import ParabolScopingSearchBar from './ParabolScopingSearchBar'
import ParabolScopingSearchResultsRoot from './ParabolScopingSearchResultsRoot'

interface Props {
  meeting: ScopePhaseAreaParabolScoping_meeting
}

const ScopePhaseAreaParabolScoping = (props: Props) => {
  const {meeting} = props
  return (
    <>
      <ParabolScopingSearchBar meeting={meeting} />
      <ParabolScopingSearchResultsRoot />
    </>
  )
}

export default createFragmentContainer(ScopePhaseAreaParabolScoping, {
  meeting: graphql`
    fragment ScopePhaseAreaParabolScoping_meeting on PokerMeeting {
      ...ParabolScopingSearchBar_meeting
    }
  `
})
