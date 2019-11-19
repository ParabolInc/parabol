import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {QueryRenderer} from 'react-relay'
import useAtmosphere from '../../hooks/useAtmosphere'
import useRouter from '../../hooks/useRouter'
import renderQuery from '../../utils/relay/renderQuery'
import RetroLobby from '../RetroLobby'

const query = graphql`
  query RetroRootQuery($teamId: ID!) {
    viewer {
      ...RetroLobby_viewer
    }
  }
`

const RetroRoot = () => {
  const atmosphere = useAtmosphere()
  const {match} = useRouter<{teamId: string}>()
  const {params} = match
  const {teamId} = params
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{teamId}}
      fetchPolicy={'store-or-network' as any}
      render={renderQuery(RetroLobby)}
    />
  )
}

export default RetroRoot
