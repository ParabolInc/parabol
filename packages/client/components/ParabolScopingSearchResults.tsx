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
  const edges = meeting.team.tasks?.edges
  const tasks = edges.map(({node}) => node)

  // TODO: add total count returned to connection e.g. connection {count, pageInfo, edges}
  return (
    <>
      <ParabolScopingSelectAllIssues selected={false} issueCount={5} />
      {tasks.map((task) => {
        return <ParabolScopingSearchResultItem key={task.id} item={task} />
      })}
    </>
  )
}

export default createFragmentContainer(ParabolScopingSearchResults, {
  meeting: graphql`
    fragment ParabolScopingSearchResults_meeting on PokerMeeting {
      id
      team {
        id
        tasks(first: 50) @connection(key: "ParabolScopingSearchResults_tasks") {
          edges {
            node {
              id
              updatedAt
              ...ParabolScopingSearchResultItem_item
            }
          }
        }
      }
    }
  `
})
