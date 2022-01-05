import {AccessibleResource} from './AtlassianManager'

const makeJiraProjectName = (projectName: string, sites: AccessibleResource[], cloudId: string) => {
  const site = sites.find((site) => site.id === cloudId)
  if (sites.length === 1 || !site) return projectName
  return `${site.name}/${projectName}`
}

export default makeJiraProjectName
