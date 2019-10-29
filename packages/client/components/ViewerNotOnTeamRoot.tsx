import React from 'react'
import graphql from 'babel-plugin-relay/macro'
import {RouteComponentProps} from 'react-router'
import {QueryRenderer} from 'react-relay'
import {LoaderSize} from '../types/constEnums'
import renderQuery from '../utils/relay/renderQuery'
import useAtmosphere from '../hooks/useAtmosphere'
import ViewerNotOnTeam from './ViewerNotOnTeam'
import NotificationSubscription from '../subscriptions/NotificationSubscription'
import useSubscription from '../hooks/useSubscription'
import OrganizationSubscription from '../subscriptions/OrganizationSubscription'
import TaskSubscription from '../subscriptions/TaskSubscription'
import TeamSubscription from '../subscriptions/TeamSubscription'

const query = graphql`
  query ViewerNotOnTeamRootQuery($teamId: ID!) {
    viewer {
      ...ViewerNotOnTeam_viewer
    }
  }
`

interface Props extends RouteComponentProps<{teamId: string}> {}

const ViewerNotOnTeamRoot = (props: Props) => {
  const {match} = props
  const {params} = match
  const {teamId} = params
  const atmosphere = useAtmosphere()
  useSubscription(ViewerNotOnTeamRoot.name, NotificationSubscription)
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{teamId}}
      render={renderQuery(ViewerNotOnTeam, {size: LoaderSize.WHOLE_PAGE, props: {teamId}})}
    />
  )
}

export default ViewerNotOnTeamRoot
