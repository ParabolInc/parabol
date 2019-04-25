const makeJiraProjectName = (projectName, sites, cloudId) => {
  if (sites.length === 1) return projectName
  const site = sites.find((site) => site.id === cloudId)
  return `${site.name}/${projectName}`
}

export default makeJiraProjectName
