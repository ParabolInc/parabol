import React from 'react'
import {graphql} from 'react-relay'
import {Redirect, RouteComponentProps} from 'react-router'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import {LoaderSize} from 'universal/types/constEnums'
import renderQuery from 'universal/utils/relay/renderQuery'
import useAtmosphere from '../hooks/useAtmosphere'
import ViewerNotOnTeam from './ViewerNotOnTeam'
import NotificationSubscription from 'universal/subscriptions/NotificationSubscription'

const query = graphql`
  query ViewerNotOnTeamRootQuery($teamId: ID!) {
    viewer {
      ...ViewerNotOnTeam_viewer
    }
  }
`

interface Props extends RouteComponentProps<{teamId: string}> {}

const subscriptions = [NotificationSubscription]
const InvoiceRoot = ({
  match: {
    params: {teamId}
  }
}: Props) => {
  const atmosphere = useAtmosphere()
  const {authObj} = atmosphere
  if (authObj && authObj.tms && authObj.tms.includes(teamId)) {
    return <Redirect to={`/team/${teamId}`} />
  }
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{teamId}}
      subscriptions={subscriptions}
      render={renderQuery(ViewerNotOnTeam, {size: LoaderSize.WHOLE_PAGE})}
    />
  )
}

export default InvoiceRoot
