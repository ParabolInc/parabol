const makeAzureDevopsProjectName = (projectName, sites, organization) => {
  if (sites.length === 1) return projectName
  const site = sites.find((site) => site.id === organization)
  return `${site.name}/${projectName}`
}

export default makeAzureDevopsProjectName
