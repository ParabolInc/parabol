import React from 'react'
import {graphql} from 'react-relay'
import {RouteComponentProps, withRouter} from 'react-router-dom'
import QueryRenderer from 'universal/components/QueryRenderer/QueryRenderer'
import MeetingContainer from 'universal/modules/meeting/containers/MeetingContainer/MeetingContainer'
import AgendaItemSubscription from 'universal/subscriptions/AgendaItemSubscription'
import NewAuthTokenSubscription from 'universal/subscriptions/NewAuthTokenSubscription'
import NotificationSubscription from 'universal/subscriptions/NotificationSubscription'
import OrganizationSubscription from 'universal/subscriptions/OrganizationSubscription'
import TaskSubscription from 'universal/subscriptions/TaskSubscription'
import TeamMemberSubscription from 'universal/subscriptions/TeamMemberSubscription'
import TeamSubscription from 'universal/subscriptions/TeamSubscription'
import {LoaderSize} from 'universal/types/constEnums'
import {cacheConfig} from 'universal/utils/constants'
import renderQuery from 'universal/utils/relay/renderQuery'
import useAtmosphere from '../../../hooks/useAtmosphere'

const query = graphql`
  query MeetingRootQuery($teamId: ID!) {
    viewer {
      ...MeetingContainer_viewer
    }
  }
`

const subscriptions = [
  AgendaItemSubscription,
  NewAuthTokenSubscription,
  NotificationSubscription,
  OrganizationSubscription,
  TaskSubscription,
  TeamMemberSubscription,
  TeamSubscription
]

interface Props
  extends RouteComponentProps<{localPhase?: string; localPhaseItem?: string; teamId: string}> {}

const MeetingRoot = ({history, location, match}: Props) => {
  const {
    params: {localPhase, localPhaseItem, teamId}
  } = match
  const atmosphere = useAtmosphere()
  return (
    <QueryRenderer
      cacheConfig={cacheConfig}
      environment={atmosphere}
      query={query}
      variables={{teamId}}
      subscriptions={subscriptions}
      subParams={{history, location}}
      render={renderQuery(MeetingContainer, {
        props: {
          localPhase,
          localPhaseItem: localPhaseItem && Number(localPhaseItem),
          teamId,
          myTeamMemberId: `${atmosphere.viewerId}::${teamId}`,
          userId: atmosphere.viewerId
        },
        size: LoaderSize.WHOLE_PAGE
      })}
    />
  )
}

export default withRouter(MeetingRoot)
