import React from 'react'
import {graphql} from 'react-relay'
import {RouteComponentProps} from 'react-router'
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
const ViewerNotOnTeamRoot = (props: Props) => {
  const {match} = props
  const {params} = match
  const {teamId} = params
  const atmosphere = useAtmosphere()
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{teamId}}
      subscriptions={subscriptions}
      render={renderQuery(ViewerNotOnTeam, {size: LoaderSize.WHOLE_PAGE, props: {teamId}})}
    />
  )
}

export default ViewerNotOnTeamRoot
