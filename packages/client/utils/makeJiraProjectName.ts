import {AccessibleResource} from './AtlassianManager'

const makeJiraProjectName = (projectName: string, sites: AccessibleResource[], cloudId: string) => {
  if (sites.length === 1) return projectName
  const site = sites.find((site) => site.id === cloudId)
  return `${site?.name}/${projectName}`
}

export default makeJiraProjectName
