import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {QueryRenderer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {TaskStatusEnum} from '~/types/graphql'
import ParabolScopingSearchResults from './ParabolScopingSearchResults'

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

const renderParabolScopingSearchResults = ({error, props}) => {
  if (error) return <div>error</div>
  if (!props) return <div>no props</div>
  return <ParabolScopingSearchResults viewer={props.viewer} />
}

interface Props {
  teamId: string
  filterQuery: string
}

const ParabolScopingSearchResultsRoot = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {teamId, filterQuery} = props
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{
        first: 50,
        teamIds: [teamId],
        userIds: [],
        status: TaskStatusEnum.active,
        filterQuery
      }}
      render={renderParabolScopingSearchResults}
    />
  )
}

export default ParabolScopingSearchResultsRoot
