import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {ScopePhaseAreaAzureDevOpsScoping_meeting$key} from '../__generated__/ScopePhaseAreaAzureDevOpsScoping_meeting.graphql'
import AzureDevOpsScopingSearchBar from './AzureDevOpsScopingSearchBar'
import AzureDevOpsScopingSearchResultsRoot from './AzureDevOpsScopingSearchResultsRoot'

interface Props {
  meetingRef: ScopePhaseAreaAzureDevOpsScoping_meeting$key
}

const ScopePhaseAreaAzureDevOpsScoping = (props: Props) => {
  const {meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment ScopePhaseAreaAzureDevOpsScoping_meeting on PokerMeeting {
        ...AzureDevOpsScopingSearchBar_meeting
        ...AzureDevOpsScopingSearchResultsRoot_meeting
      }
    `,
    meetingRef
  )
  return (
    <>
      <AzureDevOpsScopingSearchBar meetingRef={meeting} />
      <AzureDevOpsScopingSearchResultsRoot meetingRef={meeting} />
    </>
  )
}

export default ScopePhaseAreaAzureDevOpsScoping
