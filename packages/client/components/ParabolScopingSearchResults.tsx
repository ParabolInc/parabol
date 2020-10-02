import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {ParabolScopingSearchResults_meeting} from '../__generated__/ParabolScopingSearchResults_meeting.graphql'
import ParabolScopingSelectAllIssues from './ParabolScopingSelectAllIssues'
import ParabolScopingSearchResultItem from './ParabolScopingSearchResultItem'
interface Props {
  meeting: ParabolScopingSearchResults_meeting
}

const ParabolScopingSearchResults = (props: Props) => {
  const {meeting} = props
  console.log(meeting)
  const results = [
    {
      isSelected: true,
      title: 'Parabol Issue 1'
    }
  ]

  return (
    <>
      <ParabolScopingSelectAllIssues selected={false} issueCount={results.length} />
      {results.map((result) => {
        return <ParabolScopingSearchResultItem {...result} />
      })}
    </>
  )
}

export default createFragmentContainer(ParabolScopingSearchResults, {
  meeting: graphql`
    fragment ParabolScopingSearchResults_meeting on PokerMeeting {
      id
    }
  `
})
