import React from 'react'
import {graphql} from 'react-relay'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import OrgMembers from 'universal/modules/userDashboard/components/OrgMembers/OrgMembers'
import renderQuery from 'universal/utils/relay/renderQuery'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {LoaderSize} from '../../../../types/constEnums'

const query = graphql`
  query OrgMembersRootQuery($orgId: ID!, $first: Int!, $after: String) {
    viewer {
      ...OrgMembers_viewer
    }
  }
`

interface Props {
  orgId: string
}

const OrgMembersRoot = (props: Props) => {
  const {orgId} = props
  const atmosphere = useAtmosphere()
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{orgId, first: 10000}}
      render={renderQuery(OrgMembers, {size: LoaderSize.PANEL})}
    />
  )
}

export default OrgMembersRoot
