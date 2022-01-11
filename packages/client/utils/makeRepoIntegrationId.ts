const makeRepoIntegrationId = (item) => {
  const {service} = item
  switch (service) {
    case 'github':
      return item.nameWithOwner
    case 'jira':
      return `${item.cloudId}:${item.projectKey}`
  }
}

export default makeRepoIntegrationId
