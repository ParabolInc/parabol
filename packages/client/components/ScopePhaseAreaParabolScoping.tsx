import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {ScopePhaseAreaParabolScoping_meeting$key} from '../__generated__/ScopePhaseAreaParabolScoping_meeting.graphql'
import ParabolScopingSearchBar from './ParabolScopingSearchBar'
import ParabolScopingSearchResultsRoot from './ParabolScopingSearchResultsRoot'

interface Props {
  isActive: boolean
  meetingRef: ScopePhaseAreaParabolScoping_meeting$key
}

const ScopePhaseAreaParabolScoping = (props: Props) => {
  const {isActive, meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment ScopePhaseAreaParabolScoping_meeting on PokerMeeting {
        ...ParabolScopingSearchBar_meeting
        ...ParabolScopingSearchResultsRoot_meeting
      }
    `,
    meetingRef
  )

  if (!isActive) return null
  return (
    <>
      <ParabolScopingSearchBar meetingRef={meeting} />
      <ParabolScopingSearchResultsRoot meeting={meeting} />
    </>
  )
}

export default ScopePhaseAreaParabolScoping
