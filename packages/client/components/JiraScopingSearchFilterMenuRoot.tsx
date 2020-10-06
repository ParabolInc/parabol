import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {QueryRenderer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import JiraScopingSearchFilterMenu from './JiraScopingSearchFilterMenu'

const query = graphql`
  query JiraScopingSearchFilterMenuRootQuery($teamId: ID!) {
    viewer {
      ...JiraScopingSearchFilterMenu_viewer
    }
  }
`

interface Props {
  menuProps: MenuProps
  teamId: string
}

const JiraScopingSearchFilterMenuRoot = (props: Props) => {
  const {menuProps, teamId} = props
  const atmosphere = useAtmosphere()
  return (
    <QueryRenderer
      variables={{teamId}}
      environment={atmosphere}
      query={query}
      fetchPolicy={'store-or-network' as any}
      render={({props, error}) => {
        const viewer = (props as any)?.viewer ?? null
        return <JiraScopingSearchFilterMenu viewer={viewer} error={error} menuProps={menuProps} />
      }}
    />
  )
}

export default JiraScopingSearchFilterMenuRoot
