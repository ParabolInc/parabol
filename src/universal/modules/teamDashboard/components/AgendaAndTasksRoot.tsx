import React from 'react'
import {graphql} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import AgendaAndTasks from 'universal/modules/teamDashboard/components/AgendaAndTasks/AgendaAndTasks'
import AgendaItemSubscription from 'universal/subscriptions/AgendaItemSubscription'
import {LoaderSize} from 'universal/types/constEnums'
import {cacheConfig} from 'universal/utils/constants'
import renderQuery from 'universal/utils/relay/renderQuery'
import useAtmosphere from '../../../hooks/useAtmosphere'

const query = graphql`
  query AgendaAndTasksRootQuery($teamId: ID!) {
    viewer {
      ...AgendaAndTasks_viewer
    }
  }
`

const subscriptions = [AgendaItemSubscription]

interface Props extends RouteComponentProps<{teamId: string}> {}

const AgendaAndTasksRoot = (props: Props) => {
  const {
    match: {
      params: {teamId}
    }
  } = props
  const atmosphere = useAtmosphere()
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      variables={{teamId}}
      subscriptions={subscriptions}
      render={renderQuery(AgendaAndTasks, {size: LoaderSize.PANEL})}
    />
  )
}

export default withRouter(AgendaAndTasksRoot)
