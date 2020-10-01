import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {JiraScopingSearchResults_viewer} from '../__generated__/JiraScopingSearchResults_viewer.graphql'
import JiraScopingNoResults from './JiraScopingNoResults'
import JiraScopingSearchResultItem from './JiraScopingSearchResultItem'
import JiraScopingSelectAllIssues from './JiraScopingSelectAllIssues'

interface Props {
  viewer: JiraScopingSearchResults_viewer
}

const JiraScopingSearchResults = (props: Props) => {
  const {viewer} = props
  const {team} = viewer
  const {jiraIssues} = team!
  const {error, edges} = jiraIssues
  const issueCount = edges.length
  /*   const [showMock, setShowMock] = useState(false)
    useHotkey('f', () => {
      setShowMock(!showMock)
    })
    if (showMock) {
      return (
        <MockScopingList />
      )
    } */

  if (issueCount === 0) {
    return <JiraScopingNoResults error={error?.message} />
  }

  return (
    <>
      <JiraScopingSelectAllIssues selected={false} issueCount={issueCount} />
      {edges.map(({node}) => {
        return <JiraScopingSearchResultItem key={node.id} issue={node} isSelected={false} />
      })}
    </>

  )
}

export default createFragmentContainer(JiraScopingSearchResults, {
  viewer: graphql`
    fragment JiraScopingSearchResults_viewer on User {
      team(teamId: $teamId) {
        jiraIssues(first: $first, queryString: $queryString, isJQL: $isJQL, projectKeyFilters: $projectKeyFilters) @connection(key: "JiraScopingSearchResults_jiraIssues") {
          error {
            message
          }
          edges {
            node {
              ...JiraScopingSearchResultItem_issue
              id
            }
          }
        }
      }
      id
    }
  `
})
