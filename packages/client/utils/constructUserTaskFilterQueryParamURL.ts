const constructUserTaskFilterQueryParamURL = (teamIds?: string[], userIds?: string[]) => {
  if (userIds) {
    return teamIds ?
      `/me/tasks?teamId=${teamIds.join(',')}&userId=${userIds.join(',')}` :
      `/me/tasks?userId=${userIds.join(',')}`
  } else {
    return teamIds ?
      `/me/tasks?teamId=${teamIds.join(',')}` :
      '/me/tasks'
  }
}

export default constructUserTaskFilterQueryParamURL