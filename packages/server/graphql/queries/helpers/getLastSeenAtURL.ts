const getLastSeenAtURL = (queryName: string, variables: {[key: string]: any}) => {
  switch (queryName) {
    case 'AgendaAndTasksRootQuery':
      const {teamId} = variables
      return `/team/${teamId}`
    case 'MyDashboardTimelineRootQuery':
      return '/me'
    case 'MyDashboardTasksRootQuery':
      return '/me/tasks'
    case 'MeetingRootQuery':
      const {meetingId} = variables
      return `/meet/${meetingId}`
    default:
      return null
  }
}

export default getLastSeenAtURL
