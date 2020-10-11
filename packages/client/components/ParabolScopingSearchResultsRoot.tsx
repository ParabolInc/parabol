import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer, QueryRenderer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {TaskStatusEnum} from '~/types/graphql'
import ParabolScopingSearchResults from './ParabolScopingSearchResults'
import {ParabolScopingSearchResultsRoot_meeting} from '../__generated__/ParabolScopingSearchResultsRoot_meeting.graphql'
import ErrorComponent from './ErrorComponent/ErrorComponent'
import {ParabolScopingSearchResultsRootQuery} from '../__generated__/ParabolScopingSearchResultsRootQuery.graphql'

const query = graphql`
  query ParabolScopingSearchResultsRootQuery(
    $first: Int!
    $after: DateTime
    $userIds: [ID!]
    $teamIds: [ID!]
    $status: TaskStatusEnum
    $filterQuery: String
  ) {
    viewer {
      ...ParabolScopingSearchResults_viewer
    }
  }
`

interface Props {
  meeting: ParabolScopingSearchResultsRoot_meeting
}

const ParabolScopingSearchResultsRoot = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {meeting} = props
  const {teamId, parabolSearchQuery} = meeting
  const {queryString} = parabolSearchQuery
  return (
    <QueryRenderer<ParabolScopingSearchResultsRootQuery>
      environment={atmosphere}
      query={query}
      variables={{
        first: 50,
        teamIds: [teamId],
        userIds: [],
        status: TaskStatusEnum.active,
        filterQuery: queryString!.trim()
      }}
      fetchPolicy={'store-or-network' as any}
      render={({props, error}) => {
        const viewer = (props as any)?.viewer ?? null
        if (error) return <ErrorComponent error={error} eventId={''} />
        return <ParabolScopingSearchResults viewer={viewer} meeting={meeting} />
      }}
    />
  )
}

export default createFragmentContainer(ParabolScopingSearchResultsRoot, {
  meeting: graphql`
    fragment ParabolScopingSearchResultsRoot_meeting on PokerMeeting {
      ...ParabolScopingSearchResults_meeting
      parabolSearchQuery {
        queryString
        statusFilters
      }
      teamId
    }
  `
})
