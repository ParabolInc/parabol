import React from 'react'
import {graphql} from 'react-relay'
import {RouteComponentProps} from 'react-router'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import NewTeam from 'universal/modules/newTeam/NewTeam'
import {LoaderSize} from 'universal/types/constEnums'
import renderQuery from 'universal/utils/relay/renderQuery'
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
      render={renderQuery(NewTeam, {props: {defaultOrgId}, size: LoaderSize.PANEL})}
    />
  )
}

export default NewTeamRoot
