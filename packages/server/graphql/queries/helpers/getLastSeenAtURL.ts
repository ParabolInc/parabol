// @ts-ignore
import AgendaAndTasksRootQuery from '../../../../client/__generated__/AgendaAndTasksRootQuery.graphql.ts'
// @ts-ignore
import MyDashboardTimelineRootQuery from '../../../../client/__generated__/MyDashboardTimelineRootQuery.graphql.ts'
// @ts-ignore
import MyDashboardTasksRootQuery from '../../../../client/__generated__/MyDashboardTasksRootQuery.graphql.ts'
// @ts-ignore
import MeetingRootQuery from '../../../../client/__generated__/MeetingRootQuery.graphql.ts'

// Using imports here to tightly couple the name on the client to the name here to avoid silent breaks
const getLastSeenAtURL = (queryName: string, variables: {[key: string]: any}) => {
  switch (queryName) {
    case AgendaAndTasksRootQuery.params.name:
      const {teamId} = variables
      return `/team/${teamId}`
    case MyDashboardTimelineRootQuery.params.name:
      return '/me'
    case MyDashboardTasksRootQuery.params.name:
      return '/me/tasks'
    case MeetingRootQuery.params.name:
      const {meetingId} = variables
      return `/meet/${meetingId}`
    default:
      return null
  }
}

export default getLastSeenAtURL
