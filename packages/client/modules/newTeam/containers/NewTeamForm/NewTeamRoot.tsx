import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {RouteComponentProps} from 'react-router'
import {QueryRenderer} from 'react-relay'
import NewTeam from '../../NewTeam'
import {LoaderSize} from '../../../../types/constEnums'
import renderQuery from '../../../../utils/relay/renderQuery'
import useAtmosphere from '../../../../hooks/useAtmosphere'

const query = graphql`
  query NewTeamRootQuery {
    viewer {
      ...NewTeam_viewer
    }
  }
`

interface Props extends RouteComponentProps<{defaultOrgId: string}> {}

const NewTeamRoot = ({
  match: {
    params: {defaultOrgId}
  }
}: Props) => {
  const atmosphere = useAtmosphere()
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{}}
      fetchPolicy={'store-or-network' as any}
      render={renderQuery(NewTeam, {props: {defaultOrgId}, size: LoaderSize.PANEL})}
    />
  )
}

export default NewTeamRoot
