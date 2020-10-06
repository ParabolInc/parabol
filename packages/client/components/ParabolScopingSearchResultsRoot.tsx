import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {QueryRenderer} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import ParabolScopingSearchResults from './ParabolScopingSearchResults'

const query = graphql`
  query ParabolScopingSearchResultsRootQuery(
    $first: Int!
    $after: DateTime
    $userIds: [ID!]
    $teamIds: [ID!]
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
  teamIds?: string[] | null
  userIds?: string[] | null
}

const ParabolScopingSearchResultsRoot = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {teamIds, userIds} = props
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{
        first: 10,
        teamIds: teamIds || [],
        userIds: userIds || []
      }}
      render={renderParabolScopingSearchResults}
    />
  )
}

export default ParabolScopingSearchResultsRoot
