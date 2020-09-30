import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import MockScopingList from '../modules/meeting/components/MockScopingList'
import {JiraScopingSearchResults_meeting} from '../__generated__/JiraScopingSearchResults_meeting.graphql'
import JiraScopingNoResults from './JiraScopingNoResults'
import JiraScopingSearchResultItem from './JiraScopingSearchResultItem'
import JiraScopingSelectAllIssues from './JiraScopingSelectAllIssues'

interface Props {
  meeting: JiraScopingSearchResults_meeting
}

const JiraScopingSearchResults = (_props: Props) => {
  // const {meeting} = props
  const loading = false
  if (loading) {
    return (
      <MockScopingList />
    )
  }

  const results = [{
    isSelected: true,
    title: 'Jira Issue 1',
    issueKey: 'KEYFOO',
    projectKey: 'PROJ_FOO',
    cloudName: 'CLOUDFOOD',
  }]

  if (results.length === 0) {
    return <JiraScopingNoResults />
  }

  return (
    <>
      <JiraScopingSelectAllIssues selected={false} issueCount={results.length} />
      {results.map((result) => {
        return <JiraScopingSearchResultItem {...result} />
      })}
    </>

  )
}

export default createFragmentContainer(JiraScopingSearchResults, {
  meeting: graphql`
    fragment JiraScopingSearchResults_meeting on PokerMeeting {
      id
    }
  `
})
